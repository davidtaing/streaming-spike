import fs from "fs";
import csv from "csv";
import pino from "pino";

const logger = pino({ level: "debug" });

const csvPath = "data.csv";

type Inventory = {
  "Product ID": number;
  Name: string;
  Price: number;
  Quantity: number;
};

// We'll arbitrarily transform the data to include a new field
type TransformedOutput = Inventory & {
  "Total Value": number;
};

/**
 * This function adds a delay to the row result in order to simulate a slow process
 * such as a network request or a database query
 * @param row
 */
async function delayResult(row: Inventory): Promise<void> {
  logger.debug({ rowId: row["Product ID"] }, "delayed result");

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(row);
    }, 1000);
  });
}

const calculateTotalValue = (price: number, quantity: number) =>
  parseFloat((price * quantity).toFixed(2));

const transformRow = (row: Inventory, results: TransformedOutput[]): void => {
  const transformedRow = {
    ...row,
    "Total Value": calculateTotalValue(row.Price, row.Quantity),
  };
  logger.debug(transformedRow, "transformed row");
  results.push(transformedRow);
};

const results: TransformedOutput[] = [];

fs.createReadStream(csvPath)
  .pipe(csv.parse({ columns: true }))
  .on("data", delayResult) // arbitrarily add a delay to simulate a slow process
  .on("data", (row) => transformRow(row, results))
  .on("end", () => {
    logger.info({ results }, "results");
  });
