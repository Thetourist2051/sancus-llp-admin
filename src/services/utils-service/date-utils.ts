export const formatDate = (dateInput: string | Date): string => {
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return "-";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // January is 0
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
