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
    const lines = inputText.split(/, |,|=|\n/);
    const newErrors = [];
  
    const addressAmountMap = {};
  
    lines.forEach((line, index) => {
      // Split the line by space
      const parts = line.split(" ");
  
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
        newErrors.push(
          `Line ${index + 1} has an invalid address: ${address}`
        );
      }
  
      // Check if the amount is a valid number
      if (isNaN(amount)) {
        newErrors.push(
          `Line ${index + 1} has an invalid amount: ${amount}`
        );
      }
  
      // Combine balances
      if (!addressAmountMap[address]) {
        addressAmountMap[address] = parseInt(amount);
      } else {
        addressAmountMap[address] += parseInt(amount);
      }
    });
  
    setErrors(newErrors);
  
    if (newErrors.length === 0) {
      setValidationMessage("Input is valid.");
    } else {
      setValidationMessage("Input contains errors.");
    }
  
    // Check for duplicates and build the duplicate message
    const duplicates = {};
  
    Object.entries(addressAmountMap).forEach(([address, amount], index) => {
      if (amount > 0) {
        if (duplicates[address]) {
          duplicates[address].lines.push(index + 1);
        } else {
          duplicates[address] = {
            lines: [index + 1],
            amount: amount,
          };
        }
      }
    });
  
    const duplicateLines = [];
  
    Object.entries(duplicates).forEach(([address, data]) => {
      if (data.lines.length > 1) {
        duplicateLines.push(
          `Address ${address} encountered duplicate in line: ${data.lines.join(
            ", "
          )}`
        );
      }
    });
  
    setDuplicateMessage(duplicateLines.join(" "));
  
    // Set output message
    setOutputMessage(
      `${newErrors.length === 0 ? "Input is valid." : "Input contains errors."}\n${duplicateMessage}`
    );
  };

  const keepFirstOne = () => {
    clearOutputMessage();
    setErrors([]);
    const lines = inputText.split("\n");
    const uniqueLines = [];
    const seenAddresses = new Set();

    lines.forEach((line) => {
      const parts = line.split(" ");
      const address = parts[0];

      if (!seenAddresses.has(address)) {
        seenAddresses.add(address);
        uniqueLines.push(line);
      }
    });

    setInputText(uniqueLines.join("\n"));

    // Set output message
    setOutputMessage("Kept the first occurrence of each address.");
  };

  const combineBalances = () => {
    clearOutputMessage();
    setErrors([]);
    setInputText(combineDuplicateBalances(inputText));

    // Set output message
    setOutputMessage(
      generateDuplicateMessage(inputText)
    );
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

  const sumDuplicateBalances = () => {
    clearOutputMessage();
    setErrors([]);
    setInputText(sumDuplicateAddressBalances(inputText));

    // Set output message
    setOutputMessage("Summed duplicate balances.");
  };

  const combineDuplicateBalances = (text) => {
    const lines = text.split("\n");
    const addressAmountMap = {};

    lines.forEach((line) => {
      const parts = line.split(" ");
      const address = parts[0];
      const amount = parseInt(parts[1]);

      if (!addressAmountMap[address]) {
        addressAmountMap[address] = [amount];
      } else {
        addressAmountMap[address].push(amount);
      }
    });

    const combinedLines = Object.entries(addressAmountMap).map(
      ([address, amounts]) => {
        return `${address} ${amounts.join(", ")}`;
      }
    );

    return combinedLines.join("\n");
  };

  const sumDuplicateAddressBalances = (text) => {
    const lines = text.split("\n");
    const addressAmountMap = {};

    lines.forEach((line) => {
      const parts = line.split(" ");
      const address = parts[0];
      const amount = parseInt(parts[1]);

      if (!addressAmountMap[address]) {
        addressAmountMap[address] = amount;
      } else {
        addressAmountMap[address] += amount;
      }
    });

    const summedLines = Object.entries(addressAmountMap).map(
      ([address, amount]) => {
        return `${address} ${amount}`;
      }
    );

    return summedLines.join("\n");
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
