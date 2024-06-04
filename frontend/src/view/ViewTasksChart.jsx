import axios from 'axios';
import { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts';
import './ViewTasksChart.css';

function ViewTasksChart() {
    const [tasks, setTasks] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        async function getTasks() {
            try {
                const res = await axios.get('/api/private/tasks');
                setTasks(res.data.tasks);
            } catch (err) {
                console.error('Error fetching tasks:', err);
            }
        }

        getTasks();
    }, []);

    useEffect(() => {
        function getFrequencies() {
            const frequency = {};
            tasks.forEach(task => {
                const deadline = new Date(task.task_deadline);
                const time = deadline.getDay() - new Date().getDay();
                frequency[time] = (frequency[time] || 0) + 1;
            });
            return frequency;
        }

        const timeFrequencies = getFrequencies();
        const values = Object.entries(timeFrequencies).map(([time, frequency]) => ({
            value: frequency,
            label: `${time} days left`,
        }));
        setData(values);
    }, [tasks]);

    return (
        <div className="chart-container">
            <h2 className="chart-title">Task Deadlines Overview</h2>
            <div className="pie-chart">
                <PieChart
                    series={[
                        {
                            data: data,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                        },
                    ]}
                    width={400}
                    height={400}
                />
            </div>
        </div>
    );
}

export default ViewTasksChart;
