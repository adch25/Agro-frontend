import React from "react";

const DynamicLegend = ({ ColorLegendsDataItem }) => {
  const { Title, Colors, min, max } = ColorLegendsDataItem;

  const generateValues = (min, max, length) => {
    if (length < 2) return [min];
    const step = (max - min) / (length - 1);
    return Array.from({ length }, (_, i) =>
      Number((min + i * step).toFixed(1))
    );
  };

  const values = generateValues(min, max, 11);

  return (
    <div className="legend_container">
      <p>{Title}</p>

      <div className="legend-color-container">
        {Colors.map((color, index) => (
          <div key={index} className="legend_item">
            <span
              className="legend_item_square"
              style={{ backgroundColor: color }}
            />
            <span className="legend-label">
              {index === Colors.length - 1
                ? `> ${values[index]}`
                : // index === 0 ? `< ${reversedValues[index]}` :
                  `${values[index]} — ${values[index + 1]}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicLegend;
