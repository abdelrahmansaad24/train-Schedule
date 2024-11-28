import React from 'react';
import './DataDisplay.css';

const formatTime = (dateTime) => {
    if (!dateTime) {
        return "Invalid Time"; // Handle null/undefined values
    }
    const date = new Date(dateTime.toString());
    if (isNaN(date.getTime())) {
        return "Invalid Time"; // Handle invalid date values
    }
    return new Intl.DateTimeFormat('default', {
        hour: 'numeric',
        minute: 'numeric'
    }).format(date);
};

const DataDisplay = (props) => {
    const departureData = props.departureData;
    const data = props.arrivalData
        .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
        .map((train) => {
            const tr = departureData.find((tr) => tr.trainNumber === train.trainNumber);

            return {
                ...train,
                time1:
                    train.actualTime &&
                    formatTime(train.actualTime) !== formatTime(train.scheduledTime) ? (
                        <>
                            <span className="red">{formatTime(train.actualTime)}</span>
                            <span className="under">({formatTime(train.scheduledTime)})</span>
                        </>
                    ) : (
                        formatTime(train.scheduledTime)
                    ),
                time2:
                    tr &&
                    formatTime(tr.actualTime) !== formatTime(tr.scheduledTime) ? (
                        <>
                            <span className="red">{formatTime(tr.actualTime)}</span>
                            <span className="under">({formatTime(tr.scheduledTime)})</span>
                        </>
                    ) : (
                        formatTime(tr ? tr.scheduledTime : train.scheduledTime)
                    ),
            };
        })
        .map((train) => (
            <tr
                key={train.trainNumber + '_' + train.scheduledTime}
                className={train.cancelled ? 'cancelled' : null}
                aria-live="polite"  // Inform screen reader users of updates to this row
            >
                <td>{train.trainNumber}</td>
                <td>{train.origin}</td>
                <td>{train.destination}</td>
                <td>
                    {train.time1}{' '}
                    {train.cancelled ? <span className="cancelled" aria-live="assertive">Cancelled</span> : null}
                </td>
                <td>
                    {train.time2}{' '}
                    {train.cancelled ? <span className="cancelled" aria-live="assertive">Cancelled</span> : null}
                </td>
            </tr>
        ));

    console.log(data.length);

    return (
        <div>
            <table className="DataDisplay" aria-describedby="trainScheduleInfo">
                <thead>
                <tr>
                    <th>Train</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                </tr>
                </thead>
                {data.length ? (
                    <tbody>{data}</tbody>
                ) : null }
            </table>
            {data.length ? (
                null
            ) : (
                <p id="trainScheduleInfo" role="alert">No available trains</p> // Alert screen readers to no available data
            )}
        </div>
    );
};

export default DataDisplay;
