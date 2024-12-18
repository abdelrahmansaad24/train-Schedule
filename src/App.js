import React, { Component } from 'react';
import './App.css';
import Header from './components/Header/Header';
import SearchBar from './components/SearchBar/SearchBar';
import DataDisplay from './components/DataDisplay/DataDisplay';

const API = 'https://rata.digitraffic.fi/api/v1/';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            stations: [], // needed as sometimes origin or destination isn't a passenger station
            passengerStations: [], //used for displaying suggestions in search input
            todaysTrains: [],
            selectedStation: null,
            arrivalData: [],
            departureData: [],
            tabIndex: 0 // 0 = arrivals, 1 = departures
        };
    }

    componentDidMount() {
        this.fetchAll();
    }

    componentDidUpdate() {
        document.title = 'Train Station Information'; // when user switches language
    }

    handleInputChange = selectedStation => {
        this.setState({ selectedStation });
        this.filterData(selectedStation);
    };

    fetchAll() {
        const dateNow = new Date().toISOString().slice(0, 10); // format of type 2019-02-12
        Promise.all([
            fetch(`${API}metadata/stations`).then(response => response.json()),
            fetch(`${API}trains/${dateNow}`).then(response => response.json())
        ]).then(
            allResponses => {
                const stations = allResponses[0].map(station => ({
                    value: station.stationShortCode,
                    label: station.stationName.includes(' asema')
                        ? station.stationName.slice(0, -6)
                        : station.stationName
                }));
                const passengerStations = allResponses[0]
                    .filter(station => station.passengerTraffic === true)
                    .map(station => ({
                        value: station.stationShortCode,
                        label: station.stationName.includes(' asema')
                            ? station.stationName.slice(0, -6)
                            : station.stationName
                    }));
                const todaysTrains = allResponses[1];
                this.setState({ stations, passengerStations, todaysTrains });
            },
            error => {
                this.setState({ error });
            }
        );
    }

    filterData(selectedStation) {
        const { todaysTrains, stations } = this.state;
        const dateTimeNow = new Date().toJSON();
        const filteredData = todaysTrains
            .map(train => {
                const trainNumber = train.commuterLineID
                    ? `Commuter train ${train.commuterLineID}`
                    : `${train.trainType} ${train.trainNumber}`; //special case for Commuter trains who have their own ID
                const originShortCode = train.timeTableRows[0].stationShortCode; // the origin (Lähtöasema) is the first entry in the timeTable
                const origin = stations.find(
                    station => station.value === originShortCode
                ).label; // retrieves the full name of station by short code
                const destinationShortCode =
                    train.timeTableRows[train.timeTableRows.length - 1][
                        'stationShortCode'
                        ];
                const destination = stations.find(
                    station => station.value === destinationShortCode
                ).label;

                let scheduledArrivalTime; // arrivals
                let actualArrivalTime;
                const arrivalTimeTable = {
                    ...train.timeTableRows.filter(
                        element =>
                            element.stationShortCode === selectedStation.value &&
                            element.type === 'ARRIVAL'
                    )[0]
                };
                if (arrivalTimeTable) {
                    if (arrivalTimeTable.hasOwnProperty('scheduledTime')) {
                        scheduledArrivalTime = arrivalTimeTable.scheduledTime;
                    }
                    if (arrivalTimeTable.hasOwnProperty('actualTime')) {
                        actualArrivalTime = arrivalTimeTable.actualTime;
                    } else if (arrivalTimeTable.hasOwnProperty('liveEstimateTime')) {
                        actualArrivalTime = arrivalTimeTable.liveEstimateTime;
                    } else {
                        actualArrivalTime = false;
                    }
                }
                let scheduledDepartureTime; // departures
                let actualDepartureTime;
                const departureTimeTable = {
                    ...train.timeTableRows.filter(
                        element =>
                            element.stationShortCode === selectedStation.value &&
                            element.type === 'DEPARTURE'
                    )[0]
                };
                if (departureTimeTable) {
                    if (departureTimeTable.hasOwnProperty('scheduledTime')) {
                        scheduledDepartureTime = departureTimeTable.scheduledTime;
                    }
                    if (departureTimeTable.hasOwnProperty('actualTime')) {
                        actualDepartureTime = departureTimeTable.actualTime;
                    } else if (departureTimeTable.hasOwnProperty('liveEstimateTime')) {
                        actualDepartureTime = departureTimeTable.liveEstimateTime;
                    } else {
                        actualDepartureTime = false;
                    }
                }

                return {
                    ...train,
                    trainNumber,
                    origin,
                    destination,
                    scheduledArrivalTime,
                    actualArrivalTime,
                    scheduledDepartureTime,
                    actualDepartureTime
                };
            })
            .filter(train => train.trainCategory !== 'Cargo') // removes cargo entries
            .filter(
                train =>
                    train.actualArrivalTime > dateTimeNow ||
                    train.scheduledArrivalTime > dateTimeNow ||
                    train.actualDepartureTime > dateTimeNow ||
                    train.scheduledDepartureTime > dateTimeNow
            ); // filters only time entries after "now"
        const arrivalData = filteredData
            .filter(entry => typeof entry.scheduledArrivalTime !== 'undefined')
            .map(entry => ({
                ...entry,
                actualTime: entry.actualArrivalTime,
                scheduledTime: entry.scheduledArrivalTime
            }));
        const departureData = filteredData
            .filter(entry => typeof entry.scheduledDepartureTime !== 'undefined')
            .map(entry => ({
                ...entry,
                actualTime: entry.actualDepartureTime,
                scheduledTime: entry.scheduledDepartureTime
            }));
        this.setState({ arrivalData, departureData });
    }

    render() {
        const {
            error,
            arrivalData,
            departureData,
            todaysTrains
        } = this.state;
        const errorDisplay = (
            <div className="error">{error ? error.message : null}</div>
        );
        const content =
            todaysTrains.length === 0 ? (
                <p className="loading">Loading...</p>
            ) : (
                <div>
                    <div role="region" aria-live="polite" aria-atomic="true">
                        <DataDisplay display="departure" arrivalData={arrivalData} departureData={departureData} />
                    </div>
                    {errorDisplay}
                </div>
            );
        console.log(this.state.passengerStations)
        return (
            <div className="App">
                <Header />
                <SearchBar
                    placeholder='Look for train station'
                    options={this.state.passengerStations}
                    onChange={this.handleInputChange}
                    aria-label="Search for train stations"
                />
                {content}
            </div>
        );
    }
}

export default App;
