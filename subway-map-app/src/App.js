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



  return (
    <div className="App">
      <header className="App-header">
        <SubwayMap className="Subway-map" viewBox={viewBox} />

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
