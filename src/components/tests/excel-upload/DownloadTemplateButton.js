import React from "react";
import * as XLSX from "xlsx";

const DownloadTemplateButton = () => {
  const downloadTemplate = () => {
    // Define the headers for the Excel file
    const headers = [
      "question",
      "type",
      "difficulty",
      "domain",
      "option_1",
      "option_2",
      "option_3",
      "option_4",
      "option_5",
      "correct_options",
      "time_limit_in_seconds"
    ];

    // Sample row with example data
    const sampleRow1 = [
      "What is the capital of France?",
      "single",
      "beginner",
      "Geography",
      "Madrid",
      "Berlin",
      "Rome",
      "Paris",
      "", // choice_5 is left blank
      "option_4",
      30,
    ];

    const sampleRow2 = [
      "Who wrote the play Romeo and Juliet?",
      "single",
      "medium",
      "Literature",
      "Charles Dickens",
      "William Shakespeare",
      "Mark Twain",
      "Leo Tolstoy",
      "", // choice_5 is left blank
      "option_2",
      30,
    ];

    const sampleRow3 = [
      "What is the chemical symbol for water?",
      "single",
      "medium",
      "Science",
      "H2O",
      "O2",
      "CO2",
      "H2",
      "", // choice_5 is left blank
      "option_1",
      30,
    ];

    const sampleRow4 = [
      "Which of the following are programming languages?",
      "multiple",
      "hard",
      "Technology",
      "Python",
      "HTML",
      "Java",
      "CSS",
      "JavaScript", // choice_5 is left blank
      "option_1,option_3,option_5",
      30,
    ];

    const sampleRow5 = [
      "Which of the following are prime numbers?",
      "multiple",
      "beginner",
      "Mathematics",
      "2",
      "3",
      "4",
      "5",
      "6", // choice_5 is left blank
      "option_1,option_2,option_4",
      30,
    ];

    const sampleRow6 = [
      "Write an SQL query to retrieve the top 3 students with the highest marks from a students table. The table has two columns: student_name and marks.",
      "text",
      "medium",
      "Technology",
      "",
      "",
      "",
      "",
      "", // choice_5 is left blank
      "",
      30,
    ];

    // Create a worksheet with the headers and sample row
    const worksheetData = [headers, sampleRow1,sampleRow2,sampleRow3,sampleRow4,sampleRow5,sampleRow6];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions Template");

    // Write the workbook to a file and trigger the download
    XLSX.writeFile(workbook, "questions_template.xlsx");
  };

  return (
    <button onClick={downloadTemplate} className="download-btn text-white btn-brand-blue px-2 py-1.5 text-sm rounded-md">
      Download Questions Template
    </button>
  );
};

export default DownloadTemplateButton;
