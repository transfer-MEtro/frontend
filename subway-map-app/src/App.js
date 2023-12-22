import { useEffect, useState } from 'react';
import unescapeJs from 'unescape-js';
import './App.css';
import stationDictionary from './stationDictionary.js';

// importing assets
import { ReactComponent as SubwayMap } from './assets/map.svg';
import ZoomInIcon from './assets/zoom_in.png'; // Adjust path as necessary
import ZoomOutIcon from './assets/zoom_out.png'; // Adjust path as necessary
import RightArrowIcon from './assets/right_arrow.png';
import LeftArrowIcon from './assets/left_arrow.png';


function App() {

  // --------------------------------------------------
  //                        MENU
  // --------------------------------------------------
  const handleStationClick = (station) => {
    const rawStationName = station.getAttribute('data-station-name');
    const decodedStationName = unescapeJs(rawStationName);
    setSelectedStationName(decodedStationName);
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


  // --------------------------------------------------
  //                 INITIAL VIEWBOX
  // --------------------------------------------------
  const svgWidth = 1000; // Replace with actual width of your SVG
  const svgHeight = 1000; // Replace with actual height of your SVG
  const MIN_ZOOM_LEVEL = 1.0;
  const initialZoom = 0.3;
  const offsetX = 300; // Increase or decrease this value to shift more or less
  const offsetY = 50; // Increase or decrease this value to shift more or less

  const initialViewBoxString = `${(svgWidth / 2 * (1 - initialZoom)) + offsetX} ${(svgHeight / 2 * (1 - initialZoom)) + offsetY} ${svgWidth * initialZoom} ${svgHeight * initialZoom}`;
  const [viewBox, setViewBox] = useState(initialViewBoxString);

  // --------------------------------------------------
  //                     PANNING
  // --------------------------------------------------
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


  // --------------------------------------------------
  //                        ZOOM
  // --------------------------------------------------
  const [zoomLevel, setZoomLevel] = useState(initialZoom);

  const handleZoomIn = () => {
    setZoomLevel(prevZoomLevel => Math.min(prevZoomLevel * 1.2, 5)); // Zoom in by 20%, max zoom level 5
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoomLevel => Math.max(prevZoomLevel / 1.2, MIN_ZOOM_LEVEL)); // Ensure zoom level does not go below MIN_ZOOM_LEVEL
  };

  useEffect(() => {
    if (zoomLevel !== initialZoom) {
      const currentViewBox = viewBox.split(' ').map(Number);

      const newWidth = svgTotalWidth / zoomLevel;
      const newHeight = svgTotalHeight / zoomLevel;

      // Calculate the center based on the current viewBox
      const centerX = currentViewBox[0] + currentViewBox[2] / 2;
      const centerY = currentViewBox[1] + currentViewBox[3] / 2;

      const newX = centerX - newWidth / 2;
      const newY = centerY - newHeight / 2;

      setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    }
  }, [zoomLevel, viewBox, initialZoom]);


  // --------------------------------------------------
  //                        DRAWER
  // --------------------------------------------------
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // GET TRAINS AND CONGESTION DATA
  const [selectedStationName, setSelectedStationName] = useState('');
  const [stationData, setStationData] = useState([]);

  useEffect(() => {
    if (selectedStationName) {
      console.log(selectedStationName);
      const url = `http://127.0.0.1:5001/congestions/${encodeURIComponent(selectedStationName)}`;

      fetch(url)
        .then(response => response.json())
        .then(data => {
          // Process your data here
          setStationData(data);
          console.log(data);
          console.log(`Station was clicked: ${data.stationName}`);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }, [selectedStationName]);


  // SECONDS TO MINUTES
  function formatETA(seconds) {
    if (seconds === 0) {
      return `도착`;
    } else if (seconds < 60) {
      return `${seconds}초`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}분 ${remainingSeconds}초`;
    }
  }

  // CONGESTION CLASS
  function getCongestionClass(congestionValue) {
    if (congestionValue > 160) {
      return "high-congestion";
    } else if (congestionValue > 54) {
      return "medium-congestion";
    } else {
      return "low-congestion";
    }
  }


  // --------------------------------------------------
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

        <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
          <button className="toggle-drawer-button" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
            <img src={isDrawerOpen ? LeftArrowIcon : RightArrowIcon} alt="Toggle Drawer" />
          </button>

          <div className="drawer-header">
            <h2>실시간 지하철 혼잡도</h2>
            {stationData.length > 0 && (
              <div className="station-name-box">
                {stationData[0].stationName}
              </div>
            )}
          </div>

          <div className="drawer-content">
            {stationData && (
              <div className="station-info">
                {stationData.map((item, index) => (
                  <div key={index}>
                    <p>열차번호: {item.trainId}</p>
                    <p>호선: {item.lineNumber}</p>
                    <p>예상 도착시간: {formatETA(item.estimatedTimeArrival)}</p>
                    <p>다음역: {stationDictionary[item.nextStationId]}</p>
                    <p>전역: {stationDictionary[item.previousStationId]}</p>
                    <div className="congestions-container">
                      {item.congestions.map((congestion, idx) => (
                        <div
                          key={idx}
                          className={`congestion-rect ${getCongestionClass(congestion)}`}
                        >
                          {congestion}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </header>
    </div>
  );
}

export default App;
