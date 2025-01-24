import React, { useState } from "react";

const SelectionButtons: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options: string[] = ["기획", "개발", "디자인"];

  const toggleOption = (option: string) => {
    setSelectedOptions((prev: string[]) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="flex space-x-4">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => toggleOption(option)}
          className={`
            px-4 py-2 rounded-md transition-colors duration-200
            ${
              selectedOptions.includes(option)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }
          `}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SelectionButtons;
