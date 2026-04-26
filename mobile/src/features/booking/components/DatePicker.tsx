import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { colors, typography, spacing } from "../../../constants";
import {
  buildMonthSectionsFromDates,
  createCalendarRows as buildCalendarRows,
  getMonthKey,
  getReadableDate,
  normalizeDateKey as toDateKey,
  parseDateKey as toDate,
} from "../../../utils/calendar";

interface DatePickerProps {
  openDays: { id: string; date: string }[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

const WEEKDAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

const parseDateKey = (dateString: string) => {
  const [datePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (year && month && day) {
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
};

const getSelectedDateLabel = (dateString: string | null) => {
  if (!dateString) {
    return "בחר יום פנוי";
  }

  return getReadableDate(toDate(dateString));
};

const createCalendarCells = (monthDate: Date) => {
  const firstDayOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1,
  );
  const lastDayOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  );

  const leadingEmptyCells = firstDayOfMonth.getDay();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < leadingEmptyCells; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  openDays,
  selectedDate,
  onSelect,
}) => {
  const monthSections = buildMonthSectionsFromDates(openDays);

  const openDatesSet = new Set(
    openDays.map((day) => toDateKey(toDate(day.date))),
  );

  const selectedDateObject = selectedDate ? toDate(selectedDate) : null;
  const selectedDateKey = selectedDateObject
    ? toDateKey(selectedDateObject)
    : null;

  const selectedMonthKey = selectedDateObject
    ? getMonthKey(selectedDateObject)
    : monthSections[0]?.key;

  const selectedMonthIndex = Math.max(
    monthSections.findIndex((section) => section.key === selectedMonthKey),
    0,
  );

  const [currentMonthIndex, setCurrentMonthIndex] =
    React.useState(selectedMonthIndex);

  React.useEffect(() => {
    setCurrentMonthIndex(selectedMonthIndex);
  }, [selectedMonthIndex]);

  const currentMonth = monthSections[currentMonthIndex];

  if (!currentMonth) {
    return null;
  }

  const calendarRows = buildCalendarRows(currentMonth.monthDate);

  const selectedLabel = getSelectedDateLabel(selectedDate);


  return (
    <View style={styles.wrapper}>
      <View style={styles.calendarCard}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[
              styles.monthButton,
              currentMonthIndex === monthSections.length - 1 &&
                styles.monthButtonDisabled,
            ]}
            onPress={() =>
              setCurrentMonthIndex((prev) =>
                Math.min(prev + 1, monthSections.length - 1),
              )
            }
            disabled={currentMonthIndex === monthSections.length - 1}
          >
            <Text style={styles.monthButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.monthInfo}>
            <Text style={styles.monthTitle}>{currentMonth.label}</Text>
            <Text style={styles.monthSelection}>{selectedLabel}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.monthButton,
              currentMonthIndex === 0 && styles.monthButtonDisabled,
            ]}
            onPress={() =>
              setCurrentMonthIndex((prev) => Math.max(prev - 1, 0))
            }
            disabled={currentMonthIndex === 0}
          >
            <Text style={styles.monthButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {monthSections.length > 1 && (
          <View style={styles.monthDotsRow}>
            {monthSections.map((section, index) => {
              const isActive = index === currentMonthIndex;
              return (
                <TouchableOpacity
                  key={section.key}
                  style={[styles.monthDot, isActive && styles.monthDotActive]}
                  onPress={() => setCurrentMonthIndex(index)}
                />
              );
            })}
          </View>
        )}

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label) => (
            <Text key={label} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {calendarRows.map((row, rowIndex) => (
            <View key={`week-${rowIndex}`} style={styles.calendarRow}>
              {row.map((cell, cellIndex) => {
                if (!cell) {
                  return (
                    <View
                      key={`empty-${rowIndex}-${cellIndex}`}
                      style={styles.emptyCell}
                    />
                  );
                }

                const dateKey = toDateKey(cell);
                const isOpen = openDatesSet.has(dateKey);
                const isSelected = selectedDateKey === dateKey;
                const isToday = dateKey === toDateKey(new Date());

                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={[
                      styles.dayCell,
                      isOpen && styles.dayCellOpen,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => isOpen && onSelect(dateKey)}
                    disabled={!isOpen}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        isOpen && styles.dayNumberOpen,
                        isSelected && styles.dayNumberSelected,
                      ]}
                    >
                      {cell.getDate()}
                    </Text>
                    {isToday && !isSelected && (
                      <View style={styles.todayMarker} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendSwatchSelected]} />
            <Text style={styles.legendText}>נבחר</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.legendSwatchOpen]} />
            <Text style={styles.legendText}>פנוי</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.xl,
  },
  calendarCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    elevation: 3,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonDisabled: {
    opacity: 0.3,
  },
  monthButtonText: {
    fontSize: typography.sizes.xl,
    color: colors.textPrimary,
  },
  monthInfo: {
    flex: 1,
    alignItems: "center",
  },
  monthTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.textPrimary,
  },
  monthSelection: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  monthDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  monthDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#DDD6C8",
  },
  monthDotActive: {
    width: 18,
    backgroundColor: colors.gold,
  },
  weekdayRow: {
    flexDirection: "row-reverse",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  grid: {
    gap: spacing.sm,
  },
  calendarRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  emptyCell: {
    flex: 1,
    aspectRatio: 1,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2EDE4",
  },
  dayCellOpen: {
    backgroundColor: "#FFF9EE",
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.gold,
    borderWidth: 1,
  },
  dayNumber: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: "#C1B7A9",
  },
  dayNumberOpen: {
    color: colors.textPrimary,
  },
  dayNumberSelected: {
    color: colors.textWhite,
  },
  todayMarker: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  legendRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  legendItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendSwatchSelected: {
    backgroundColor: colors.primary,
  },
  legendSwatchOpen: {
    backgroundColor: "#FFF9EE",
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
