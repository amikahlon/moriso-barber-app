export interface MonthSection {
  key: string;
  label: string;
  monthDate: Date;
}

const HEBREW_LOCALE = "he-IL";

export const normalizeDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateString: string) => {
  const [datePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date(dateString);
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}`;

export const getMonthStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);

export const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat(HEBREW_LOCALE, {
    month: "long",
    year: "numeric",
  }).format(date);

export const getReadableDate = (date: Date) =>
  new Intl.DateTimeFormat(HEBREW_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

export const buildFutureMonthSections = (monthsCount: number) => {
  const today = new Date();
  const sections: MonthSection[] = [];

  for (let index = 0; index < monthsCount; index += 1) {
    const monthDate = new Date(
      today.getFullYear(),
      today.getMonth() + index,
      1,
      12,
      0,
      0,
      0,
    );

    sections.push({
      key: getMonthKey(monthDate),
      label: getMonthLabel(monthDate),
      monthDate,
    });
  }

  return sections;
};

export const buildMonthSectionsFromDates = (
  dateItems: { date: string }[],
) => {
  const monthMap = new Map<string, MonthSection>();

  dateItems
    .slice()
    .sort(
      (a, b) => parseDateKey(a.date).getTime() - parseDateKey(b.date).getTime(),
    )
    .forEach((item) => {
      const monthDate = getMonthStart(parseDateKey(item.date));
      const key = getMonthKey(monthDate);

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          key,
          label: getMonthLabel(monthDate),
          monthDate,
        });
      }
    });

  return Array.from(monthMap.values());
};

export const createCalendarCells = (monthDate: Date) => {
  const firstDayOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1,
    12,
    0,
    0,
    0,
  );
  const lastDayOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
    12,
    0,
    0,
    0,
  );
  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstDayOfMonth.getDay(); index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day += 1) {
    cells.push(
      new Date(monthDate.getFullYear(), monthDate.getMonth(), day, 12, 0, 0, 0),
    );
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

export const createCalendarRows = (
  monthDate: Date,
  options: { reverseWeeks?: boolean } = {},
) => {
  const cells = createCalendarCells(monthDate);
  const rows: Array<Array<Date | null>> = [];

  for (let index = 0; index < cells.length; index += 7) {
    const row = cells.slice(index, index + 7);
    rows.push(options.reverseWeeks ? row.reverse() : row);
  }

  return rows;
};
