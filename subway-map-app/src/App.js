import { useEffect, useState } from 'react';
import unescapeJs from 'unescape-js';
import './App.css';

// importing assets
import { ReactComponent as SubwayMap } from './assets/map.svg';
import ZoomInIcon from './assets/zoom_in.png'; // Adjust path as necessary
import ZoomOutIcon from './assets/zoom_out.png'; // Adjust path as necessary


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


  // INITIAL VIEW

  // Assuming you know the dimensions of your SVG
  const svgWidth = 1000; // Replace with actual width of your SVG
  const svgHeight = 1000; // Replace with actual height of your SVG
  const initialZoom = 0.3; // Adjust as needed for initial zoom level
  const offsetX = 250; // Increase or decrease this value to shift more or less
  const offsetY = 50; // Increase or decrease this value to shift more or less

  // Calculate initial viewBox values to center and zoom
  const initialViewBox = {
    x: (svgWidth / 2 * (1 - initialZoom)) + offsetX,
    y: (svgHeight / 2 * (1 - initialZoom)) + offsetY,
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

  // Define the total dimensions of the SVG
  const svgTotalWidth = 1180;
  const svgTotalHeight = 1080;

  const handleMouseMove = (event) => {
    if (isDragging) {
      const currentViewBox = viewBox.split(' ').map(Number);
      const dx = event.clientX - startDrag.x;
      const dy = event.clientY - startDrag.y;

      // Calculate potential new viewBox values
      let newViewBoxX = currentViewBox[0] - dx;
      let newViewBoxY = currentViewBox[1] - dy;

      // Calculate maximum allowable coordinates
      const maxX = svgTotalWidth - currentViewBox[2];
      const maxY = svgTotalHeight - currentViewBox[3];

      // Clamp newViewBoxX and newViewBoxY within the boundaries
      newViewBoxX = Math.min(Math.max(newViewBoxX, 0), maxX);
      newViewBoxY = Math.min(Math.max(newViewBoxY, 0), maxY);

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


  // ZOOMING
  const [zoomLevel, setZoomLevel] = useState(1); // Start with a default zoom level of 1

  const handleZoomIn = () => {
    setZoomLevel(prevZoomLevel => Math.min(prevZoomLevel * 1.2, 5)); // Zoom in by 20%, max zoom level 5
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoomLevel => Math.max(prevZoomLevel / 1.2, 0.2)); // Zoom out by 20%, min zoom level 0.2
  };

  useEffect(() => {
    if (zoomLevel !== 1) { // Only update viewBox if zoomLevel is not at its initial state
      const newWidth = svgTotalWidth / zoomLevel;
      const newHeight = svgTotalHeight / zoomLevel;
      const newX = (svgTotalWidth - newWidth) / 2;
      const newY = (svgTotalHeight - newHeight) / 2;

      setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    }
  }, [zoomLevel]);


  return (
    <div className="App" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <header className="App-header">
        <div className="map-container">
          <SubwayMap className="Subway-map" viewBox={viewBox} onMouseDown={handleMouseDown} />
        </div>
        <div className="button-container">
          <button onClick={handleZoomIn}>
            <img src={ZoomInIcon} alt="Zoom In" />
          </button>
          <button onClick={handleZoomOut}>
            <img src={ZoomOutIcon} alt="Zoom Out" />
          </button>
        </div>
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
