

import React, { useEffect, useState } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { getTasksByDate } from "../data/tasksDB";

LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ],
  monthNamesShort: [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ],
  dayNames: [
    "Domingo", "Lunes", "Martes", "Miércoles",
    "Jueves", "Viernes", "Sábado"
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
};
LocaleConfig.defaultLocale = "es";

interface Props {
  selectedDate: string;
  onSelect: (date: string) => void;
  refresh: boolean;
}

export default function CalendarComponent({ selectedDate, onSelect, refresh }: Props) {
  const [markedDates, setMarkedDates] = useState({});

  const loadMarkedDates = async () => {
    let marks: any = {};
    const currentMonth = selectedDate.substring(0, 7); 

    for (let day = 1; day <= 31; day++) {
      const date = `${currentMonth}-${String(day).padStart(2, "0")}`;

      const tasks = await getTasksByDate(date);

      if (tasks.length > 0) {        
        const hasWork = tasks.some(t => t.type === "work");       
        const hasPersonal = tasks.some(t => t.type === "personal");

        marks[date] = {
          marked: true,
          dots: [
            ...(hasWork ? [{ key: "work", color: "red" }] : []),
            ...(hasPersonal ? [{ key: "personal", color: "green" }] : []),
          ],
        };
      }
    }

    
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#4B9DFE",
    };

    setMarkedDates(marks);
  };

  useEffect(() => {
  loadMarkedDates();
}, [selectedDate, refresh]); 


  return (
    <Calendar
      onDayPress={(day) => onSelect(day.dateString)}
      markedDates={markedDates}
      markingType="multi-dot"
      theme={{
        todayTextColor: "blue",
        selectedDayBackgroundColor: "#4B9DFE",
        arrowColor: "black",
      }}
    />
  );
}
