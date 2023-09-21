import React, { useState } from "react";

function Disperse() {
  const [inputText, setInputText] = useState("");
  const [errors, setErrors] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [outputMessage, setOutputMessage] = useState("");

  const clearOutputMessage = () => {
    setOutputMessage(""); // Clear the output message
  };

  const onSubmit = () => {
    clearOutputMessage();
    setErrors([]);
    const lines = inputText.split("\n"); // Split by new line
    const newErrors = [];

    lines.forEach((line, index) => {
      // Remove leading/trailing white spaces and split the line by space, comma, or equals sign
      const trimmedLine = line.trim();
      const parts = trimmedLine.split(/[ ,=]+/);

      // Check if there are exactly two parts (address and amount)
      if (parts.length !== 2) {
        newErrors.push(`Line ${index + 1} has an invalid number of elements.`);
        return;
      }

      const address = parts[0];
      const amount = parts[1];

      // Use a regex pattern to validate the address
      const addressPattern = /^0x[0-9a-fA-F]{40}$/;
      if (!address.match(addressPattern)) {
        newErrors.push(`Line ${index + 1} has an invalid address: ${address}`);
      }

      // Check if the amount is a valid number and not negative
      if (isNaN(amount) || parseFloat(amount) < 0) {
        newErrors.push(
          `Line ${index + 1} has an invalid or negative amount: ${amount}`
        );
      }
    });

    setErrors(newErrors);

    if (newErrors.length === 0) {
      setValidationMessage("Input is valid.");
    } else {
      setValidationMessage("Input contains errors.");
    }

    // Set output message
    setOutputMessage(
      `${
        newErrors.length === 0 ? "Input is valid." : "Input contains errors."
      }\n${duplicateMessage}`
    );
  };

  const sumDuplicateBalances = () => {
    clearOutputMessage();
    setErrors([]);

    const lines = inputText.split("\n");
    const addressAmountMap = {};

    lines.forEach((line, index) => {
      // Remove leading/trailing white spaces and split the line by space, comma, or equals sign
      const trimmedLine = line.trim();
      const parts = trimmedLine.split(/[ ,=]+/);

      if (parts.length !== 2) {
        setErrors((prevErrors) => [
          ...prevErrors,
          `Line ${
            index + 1
          } should have exactly two elements (address and amount).`,
        ]);
        return;
      }

      const address = parts[0];
      const parsedAmount = parseFloat(parts[1]);

      if (!isNaN(parsedAmount)) {
        if (!addressAmountMap[address]) {
          addressAmountMap[address] = parsedAmount;
        } else {
          addressAmountMap[address] += parsedAmount;
        }
      }
    });

    // Create lines with combined amounts
    const combinedLines = Object.entries(addressAmountMap).map(
      ([address, amount]) => {
        return `${address}=${amount}`;
      }
    );

    setInputText(combinedLines.join("\n"));

    // Set output message
    setOutputMessage(
      "Combined amounts for the same address while keeping the first occurrence."
    );
  };

  const combineBalances = () => {
    clearOutputMessage();
    setErrors([]);
    const lines = inputText.split("\n");
    const addressAmountMap = {};

    lines.forEach((line, index) => {
      // Remove leading/trailing white spaces
      const trimmedLine = line.trim();

      // Split the line by space, comma, or equals sign to get address and amount
      const parts = trimmedLine.split(/[ ,=]+/);

      if (parts.length !== 2) {
        setErrors((prevErrors) => [
          ...prevErrors,
          `Line ${
            index + 1
          } should have exactly two elements (address and amount).`,
        ]);
        return;
      }

      const address = parts[0];
      const parsedAmount = parseFloat(parts[1]);

      if (!isNaN(parsedAmount)) {
        if (!addressAmountMap[address]) {
          addressAmountMap[address] = [parsedAmount];
        } else {
          addressAmountMap[address].push(parsedAmount);
        }
      }
    });

    // Combine balances for each address
    const combinedLines = Object.entries(addressAmountMap).map(
      ([address, amounts]) => {
        return `${address}=${amounts.join(",")}`;
      }
    );

    setInputText(combinedLines.join("\n"));

    // Set output message
    setOutputMessage("Combined balances.");
  };

  const generateDuplicateMessage = (text) => {
    const lines = text.split("\n");
    const addressLinesMap = {};

    lines.forEach((line, index) => {
      const parts = line.split(" ");
      const address = parts[0];

      if (!addressLinesMap[address]) {
        addressLinesMap[address] = [];
      }

      addressLinesMap[address].push(index + 1);
    });

    const duplicateLines = [];

    Object.entries(addressLinesMap).forEach(([address, lines]) => {
      if (lines.length > 1) {
        duplicateLines.push(
          `Address ${address} encountered duplicate in line: ${lines.join(
            ", "
          )}`
        );
      }
    });

    return duplicateLines.join("\n");
  };

  const keepFirstOne = () => {
    clearOutputMessage();
    setErrors([]);

    const lines = inputText.split("\n");
    const uniqueLines = [];
    const seenAddresses = new Map(); // Use a Map to track line numbers for each address
    const duplicateMessageMap = new Map(); // Use a Map to group duplicate addresses and line numbers

    lines.forEach((line, index) => {
      // Remove leading/trailing white spaces and split the line by space, comma, or equals sign
      const trimmedLine = line.trim();
      const parts = trimmedLine.split(/[ ,=]+/);

      if (parts.length !== 2) {
        setErrors((prevErrors) => [
          ...prevErrors,
          `Line ${
            index + 1
          } should have exactly two elements (address and amount).`,
        ]);
        return;
      }

      const address = parts[0];

      if (!seenAddresses.has(address)) {
        seenAddresses.set(address, index + 1); // Store the line number
        uniqueLines.push(trimmedLine);
      } else {
        if (!duplicateMessageMap.has(address)) {
          duplicateMessageMap.set(address, [seenAddresses.get(address)]);
        }
        duplicateMessageMap.get(address).push(index + 1);
      }
    });

    setInputText(uniqueLines.join("\n"));

    // Generate the duplicate message by iterating over the duplicateMessageMap
    const duplicateMessageLines = [];
    duplicateMessageMap.forEach((lineNumbers, address) => {
      duplicateMessageLines.push(
        `Address ${address} encountered duplicate in line: ${lineNumbers.join(
          ", "
        )}`
      );
    });

    // Set output message
    setOutputMessage(
      duplicateMessageLines.length > 0
        ? duplicateMessageLines.join("\n")
        : "Kept the first occurrence of each address."
    );
  };

  return (
    <div className="container mx-auto mt-8 flex flex-col items-center">
      <textarea
        className="w-[50%] h-32 p-2 border rounded-md"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter data here"
      />

      <div className="mt-4">
        <h2 className="text-green-500">Output:</h2>
        <div style={{ color: errors.length > 0 ? "red" : "black" }}>
          {outputMessage.split("\n").map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4">
          <h2 className="text-red-500">Errors:</h2>
          <ul>
            {errors.map((error, index) => (
              <li key={index} className="text-red-500">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-row mt-4 gap-4">
        <button
          onClick={onSubmit}
          className="bg-white text-black font-semibold px-4 py-2 rounded-md shadow-md hover:shadow-black transform transition-transform hover:scale-105 duration-500 flex flex-col justify-center items-center ease-in-out"
        >
          Submit
        </button>
        <button
          onClick={keepFirstOne}
          className="bg-white text-black font-semibold px-4 py-2 rounded-md shadow-md hover:shadow-black transform transition-transform hover:scale-105 duration-500 flex flex-col justify-center items-center ease-in-out"
        >
          Keep First One
        </button>
        <button
          onClick={combineBalances}
          className="bg-white text-black font-semibold px-4 py-2 rounded-md shadow-md hover:shadow-black transform transition-transform hover:scale-105 duration-500 flex flex-col justify-center items-center ease-in-out"
        >
          Combine Balances
        </button>
        <button
          onClick={sumDuplicateBalances}
          className="bg-white text-black font-semibold px-4 py-2 rounded-md shadow-md hover:shadow-black transform transition-transform hover:scale-105 duration-500 flex flex-col justify-center items-center ease-in-out"
        >
          Sum Duplicate Balances
        </button>
      </div>
    </div>
  );
}

export default Disperse;
