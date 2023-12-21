import { useEffect, useState } from 'react';
import { ReactComponent as SubwayMap } from './map.svg';
import unescapeJs from 'unescape-js';
import './App.css';

function App() {
  const [isMenuVisible, setMenuVisibility] = useState(false);
  const [menuMessage, setMenuMessage] = useState('');

  const handleStationClick = (station) => {
    console.log('홍대입구');
    console.log('Station clicked:', station.getAttribute('data-station-name'));

    const rawStationName = station.getAttribute('data-station-name');
    const decodedStationName = unescapeJs(rawStationName);
    console.log('Station clicked:', decodedStationName);
    setMenuMessage(`Station was clicked: ${decodedStationName}`);
    setMenuVisibility(true);
  };

  useEffect(() => {
    // Delay execution to ensure SVG is fully loaded
    setTimeout(() => {
      const stations = document.querySelectorAll('.st25, .st45');

      stations.forEach(station => {
        station.addEventListener('click', () => handleStationClick(station));
      });

      // Clean up event listeners
      return () => {
        stations.forEach(station => {
          station.removeEventListener('click', () => handleStationClick(station));
        });
      };
    }, 500); // Delay of 500ms; adjust as needed
  }, []);



  // Assuming you know the dimensions of your SVG
  const svgWidth = 1000; // Replace with actual width of your SVG
  const svgHeight = 1000; // Replace with actual height of your SVG
  const initialZoom = 0.5; // Adjust as needed for initial zoom level

  // Calculate initial viewBox values to center and zoom
  const initialViewBox = {
    x: svgWidth / 2 * (1 - initialZoom),
    y: svgHeight / 2 * (1 - initialZoom),
    width: svgWidth * initialZoom,
    height: svgHeight * initialZoom
  };

  const [viewBox, setViewBox] = useState(`${initialViewBox.x} ${initialViewBox.y} ${initialViewBox.width} ${initialViewBox.height}`);

  // PANNING
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setStartDrag({ x: event.clientX, y: event.clientY });
    document.body.classList.add("no-select");
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const currentViewBox = viewBox.split(' ').map(Number);
      const dx = event.clientX - startDrag.x;
      const dy = event.clientY - startDrag.y;

      // Calculate new viewBox values
      const newViewBoxX = currentViewBox[0] - dx;
      const newViewBoxY = currentViewBox[1] - dy;

      // Add boundary checks here
      // ...

      // Update the viewBox state
      setViewBox(`${newViewBoxX} ${newViewBoxY} ${currentViewBox[2]} ${currentViewBox[3]}`);
      setStartDrag({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.classList.remove("no-select");
    window.removeEventListener('mouseup', handleMouseUp);
  };


  return (
    <div className="App" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <header className="App-header">
        <SubwayMap className="Subway-map" viewBox={viewBox} onMouseDown={handleMouseDown} />

        {isMenuVisible && (
          <div className="Menu">
            {menuMessage}
          </div>
        )}

      </header>
    </div>
  );
}

export default App;
