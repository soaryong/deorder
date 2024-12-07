"use client";

import { RequestNetwork } from "@requestnetwork/request-client.js";
import useRequests from "@/hooks/useRequests";
import { useAccount } from "wagmi";

const cellStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
};

export default function InvoiceDashboardPageCustom() {
    const { address } = useAccount();

    const { data, isLoading, error, refetch } = useRequests(address as string);
    console.log(data);

    if (isLoading) return <p>Loading...</p>;
    if (error instanceof Error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h2>Request Data</h2>
            {data && data.length > 0 ? (
                <>
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
                        {data.map((request: any, index: number) => (
                            <tr key={index}>
                                <td style={cellStyle}>{request.requestId}</td>
                                <td style={cellStyle}>{request.currency}</td>
                                <td style={cellStyle}>{request.expectedAmount}</td>
                                <td style={cellStyle}>{request.payee?.value}</td>
                                <td style={cellStyle}>{request.payer?.value}</td>
                                <td style={cellStyle}>{request.contentData?.reason}</td>
                                <td style={cellStyle}>{request.contentData?.dueDate}</td>
                                <td style={cellStyle}>{request.state}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button
                        onClick={() => refetch()}
                        style={{
                            marginTop: "20px",
                            padding: "10px 20px",
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Refresh Data
                    </button>
                </>
            ) : (
                <p>No requests found.</p>
            )}
        </div>
    );
}
