import React from "react";

interface RequestData {
    currency: string;
    expectedAmount: string;
    payee: { type: string; value: string };
    payer: { type: string; value: string };
    state: string;
    contentData: { reason: string; dueDate: string };
    requestId: string;
}

interface RequestTableProps {
    requests: RequestData[];
}

const RequestTable: React.FC<RequestTableProps> = ({ requests }) => {
    return (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
            <tr>
                <th style={cellStyle}>Request ID</th>
                <th style={cellStyle}>Currency</th>
                <th style={cellStyle}>Expected Amount</th>
                <th style={cellStyle}>Payee</th>
                <th style={cellStyle}>Payer</th>
                <th style={cellStyle}>Reason</th>
                <th style={cellStyle}>Due Date</th>
                <th style={cellStyle}>State</th>
            </tr>
            </thead>
            <tbody>
            {requests.map((request) => (
                <tr key={request.requestId}>
                    <td style={cellStyle}>{request.requestId}</td>
                    <td style={cellStyle}>{request.currency}</td>
                    <td style={cellStyle}>{request.expectedAmount}</td>
                    <td style={cellStyle}>{request.payee.value}</td>
                    <td style={cellStyle}>{request.payer.value}</td>
                    <td style={cellStyle}>{request.contentData.reason}</td>
                    <td style={cellStyle}>{request.contentData.dueDate}</td>
                    <td style={cellStyle}>{request.state}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

const cellStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "8px",
};

export default RequestTable;
