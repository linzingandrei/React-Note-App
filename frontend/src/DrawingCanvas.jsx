import { useRef, useEffect, useState } from 'react';

function DrawingCanvas() {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const socket = new WebSocket('ws://localhost:8080');

        const messageHandler = (message) => {
            const { type, x, y } = JSON.parse(message.data);
            if (type === 'moveTo') {
                context.beginPath();
                context.moveTo(x, y);
            } else if (type === 'lineTo') {
                context.lineTo(x, y);
                context.stroke();
            }
        };

        socket.addEventListener('open', () => {
            setLoading(false);
        });

        socket.addEventListener('message', messageHandler);

        let painting = false;

        function startPosition(e) {
            if (loading) return; 
            painting = true;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            context.beginPath();
            context.moveTo(x, y);
            socket.send(JSON.stringify({ type: 'moveTo', x, y }));
        }

        function draw(e) {
            if (loading || !painting) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            context.lineTo(x, y);
            context.stroke();
            socket.send(JSON.stringify({ type: 'lineTo', x, y }));
        }

        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', () => painting = false);
        canvas.addEventListener('mousemove', draw);

        return () => {
            canvas.removeEventListener('mousedown', startPosition);
            canvas.removeEventListener('mouseup', () => painting = false);
            canvas.removeEventListener('mousemove', draw);
            socket.removeEventListener('message', messageHandler);
        };
    }, [loading]);

    return (
        <div>
            {loading && <div>Loading...</div>}
            <canvas ref={canvasRef} width='900px' height='250px' style={{ border: '1px solid black' }} />
        </div>
    )
}

export default DrawingCanvas;