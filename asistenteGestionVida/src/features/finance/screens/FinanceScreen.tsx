import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Transaction {
    id: number;
    category: string;
    description: string;
    amount: number;
    date: string;
    icon: string;
}

const Categories = [
    'Comida',
    'Salario',
    'Transporte',
    'Entretenimiento',
    'Compras',
    'Salud',
    'Educación',
    '📝 Otros'
] as const;
type CategoryType = typeof Categories[number];

export default function FinanceScreen() {
    const [activeTab, setActiveTab] = useState<'ingreso' | 'gasto'>('ingreso');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<CategoryType | ''>('');
    const [description, setDescription] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [balance, setBalance] = useState(0);
    const [showButton, setShowButton] = useState(true);
    const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

    useEffect(() => {
        initDatabase();
    }, []);

    const initDatabase = async () => {
        try {
            const database = await SQLite.openDatabaseAsync('finance.db');
            setDb(database);

            await database.execAsync(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    amount REAL NOT NULL,
                    category TEXT,
                    description TEXT,
                    date TEXT NOT NULL
                );
            `);

            loadTransactions(database);
        } catch (error) {
            console.error('Error initializing database:', error);
            Alert.alert('Error', 'No se pudo inicializar la base de datos');
        }
    };

    const loadTransactions = async (database: SQLite.SQLiteDatabase) => {
        try {
            const result = await database.getAllAsync<{
                id: number;
                amount: number;
                category: string;
                description: string;
                date: string;
            }>('SELECT * FROM transactions ORDER BY date DESC');

            const formattedTransactions = result.map(t => ({
                ...t,
                icon: getCategoryIcon(t.category)
            }));

            setTransactions(formattedTransactions);

            const total = result.reduce((sum, t) => sum + t.amount, 0);
            setBalance(total);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    const getCategoryIcon = (category: string): string => {
        const icons: { [key: string]: string } = {
            'Comida': '🍴',
            'Salario': '💵',
            'Transporte': '🚌',
            'Entretenimiento': '🎮',
            'Compras': '🛍️',
            'Salud': '💊',
            'Educación': '📚',
            'Otros': '📝'
        };
        return icons[category] || '📝';
    };

      const formatDate = (date: Date): string => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays < 7) {
            return `${diffDays} días, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        }
    };

    const handleRegisterTransaction = async () => {
        if (!db) {
            Alert.alert('Error', 'Base de datos no inicializada');
            return;
        }

        if (!amount || parseFloat(amount) === 0) {
            Alert.alert('Error', 'Por favor ingrese un monto válido');
            return;
        }

        if (!category) {
            Alert.alert('Error', 'Por favor seleccione una categoría');
            return;
        }

        try {
            const transactionAmount = activeTab === 'gasto'
                ? -Math.abs(parseFloat(amount))
                : Math.abs(parseFloat(amount));

            const currentDate = new Date().toISOString();

            await db.runAsync(
                'INSERT INTO transactions (amount, category, description, date) VALUES (?, ?, ?, ?)',
                [transactionAmount, category, description || '', currentDate]
            );

            // Reset form
            setAmount('');
            setCategory('');
            setDescription('');

            // Reload transactions
            await loadTransactions(db);

            Alert.alert('Éxito', 'Transacción registrada correctamente');
        } catch (error) {
            console.error('Error registering transaction:', error);
            Alert.alert('Error', 'No se pudo registrar la transacción');
        }
    };

    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        setShowButton(scrollY < 50);
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView
                style={styles.container}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <Text style={styles.title}>Gestión de Gastos</Text>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Balance Actual</Text>
                    <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
                </View>

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'ingreso' && styles.activeTab]}
                        onPress={() => setActiveTab('ingreso')}
                    >
                        <Text style={[styles.tabText, activeTab === 'ingreso' && styles.activeTabText]}>
                            Ingreso
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'gasto' && styles.activeTab]}
                        onPress={() => setActiveTab('gasto')}
                    >
                        <Text style={[styles.tabText, activeTab === 'gasto' && styles.activeTabText]}>
                            Gasto
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Amount Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Monto</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="$0.00"
                        placeholderTextColor="#A0AEC0"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />
                </View>

               {/* Category Picker */}
                 <View style={styles.inputSection}>
                    <Text style={styles.label}>Categoría</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={category}
                            onValueChange={(itemValue) => setCategory(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item
                                label="Selecciona una categoría..."
                                value=""
                                color="#A0AEC0"
                            />

                            {Categories.map((cat) => (
                                <Picker.Item
                                    key={cat}
                                    label={cat}
                                    value={cat}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Description Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Descripción (opcional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Descripción de la transacción"
                        placeholderTextColor="#A0AEC0"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Transactions History */}
                <Text style={styles.historyTitle}>Historial de Transacciones</Text>

                {transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No hay transacciones registradas</Text>
                    </View>
                ) : (
                    transactions.map((transaction) => (
                        <View key={transaction.id} style={styles.transactionItem}>
                            <View style={styles.transactionLeft}>
                                <View style={styles.iconContainer}>
                                    <Text style={styles.icon}>{transaction.icon}</Text>
                                </View>
                                <View>
                                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                                    <Text style={styles.transactionTime}>
                                        {formatDate(new Date(transaction.date))}
                                    </Text>
                                    {transaction.description ? (
                                        <Text style={styles.transactionDescription}>{transaction.description}</Text>
                                    ) : null}
                                </View>
                            </View>
                            <Text style={[
                                styles.transactionAmount,
                                transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount
                            ]}>
                                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </Text>
                        </View>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Register Button */}
            {showButton && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegisterTransaction}
                    >
                        <Text style={styles.registerButtonText}>Registrar Transacción</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#F7FAFC'
    },
    container: {
        flex: 1,
        padding: 20
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3748',
        marginBottom: 20
    },
    balanceCard: {
        backgroundColor: '#4299E1',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#4299E1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4
    },
    balanceLabel: {
        color: '#E6F4FF',
        fontSize: 14,
        marginBottom: 8
    },
    balanceAmount: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: 'bold'
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#EDF2F7',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10
    },
    activeTab: {
        backgroundColor: '#4299E1'
    },
    tabText: {
        color: '#718096',
        fontSize: 16,
        fontWeight: '600'
    },
    activeTabText: {
        color: '#FFFFFF'
    },
    inputSection: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        color: '#4A5568',
        marginBottom: 8,
        fontWeight: '600'
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#2D3748',
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
     picker: {
        backgroundColor: 'transparent',
        width: '100%',
        color: '#2D3748'
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden'
    },
    historyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3748',
        marginTop: 10,
        marginBottom: 16
    },
    transactionItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1
    },
    iconContainer: {
        backgroundColor: '#EDF2F7',
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    icon: {
        fontSize: 20
    },
    transactionCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4
    },
    transactionTime: {
        fontSize: 12,
        color: '#A0AEC0'
    },
    transactionDescription: {
        fontSize: 12,
        color: '#718096',
        marginTop: 2
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    positiveAmount: {
        color: '#48BB78'
    },
    negativeAmount: {
        color: '#F56565'
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#F7FAFC',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0'
    },
    registerButton: {
        backgroundColor: '#48BB78',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        shadowColor: '#48BB78',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    emptyState: {
        padding: 40,
        alignItems: 'center'
    },
    emptyStateText: {
        color: '#A0AEC0',
        fontSize: 16
    }
});