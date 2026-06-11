import os

css_append = """
/* =========================================
   CUSTOM CSS CHARTS (Relatórios)
========================================= */
.custom-chart-wrapper {
    display: flex;
    flex-direction: column;
    gap: 15px;
    height: 100%;
    justify-content: center;
    overflow-y: auto;
    padding-right: 5px;
}

.custom-bar-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.custom-bar-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    color: #444;
    font-weight: 600;
}

.custom-bar-track {
    width: 100%;
    height: 14px;
    background-color: #f0f2f5;
    border-radius: 8px;
    overflow: hidden;
}

.custom-bar-fill {
    height: 100%;
    border-radius: 8px;
    transition: width 1s ease-in-out;
}

.custom-donut-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 100%;
    height: 220px;
}

.custom-donut {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.custom-donut-inner {
    width: 140px;
    height: 140px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    z-index: 10;
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.02);
}

.custom-donut-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    margin-top: 25px;
}

.donut-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #555;
    font-weight: 500;
}

.donut-legend-color {
    width: 14px;
    height: 14px;
    border-radius: 4px;
}
"""

with open('static/styles.css', 'a', encoding='utf-8') as f:
    f.write(css_append)
print("CSS appended.")
