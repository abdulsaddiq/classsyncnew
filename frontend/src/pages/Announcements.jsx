import { useEffect, useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";

function Announcements() {

    const [announcements, setAnnouncements] =
        useState([]);

    useEffect(() => {

        const fetchAnnouncements =
            async () => {

                try {

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    const response =
                        await api.get(
                            "/announcements",
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );

                    setAnnouncements(
                        response.data
                    );

                } catch (error) {

                    console.error(
                        error
                    );
                }
            };

        fetchAnnouncements();

    }, []);

    return (
        <>
            <Navbar />

            <div
                style={{
                    padding: "20px"
                }}
            >

                <h1>
                    Announcements
                </h1>

                {announcements.length === 0 ? (
                    <p>
                        📢 No announcements yet
                    </p>
                ) : (
                    announcements.map(
                        (
                            announcement
                        ) => (
                            <div
                                key={
                                    announcement.id
                                }
                                style={{
                                    border:
                                        "1px solid #ddd",
                                    padding:
                                        "15px",
                                    borderRadius:
                                        "10px",
                                    marginBottom:
                                        "15px"
                                }}
                            >
                                <h3>
                                    {
                                        announcement.title
                                    }
                                </h3>

                                <p
                                    style={{
                                        color:
                                            "#666",
                                        fontSize:
                                            "14px",
                                        marginBottom:
                                            "10px"
                                    }}
                                >
                                    👤 Posted by:{" "}
                                    {
                                        announcement.created_by
                                    }
                                </p>

                                <p>
                                    {
                                        announcement.content
                                    }
                                </p>
                            </div>
                        )
                    )
                )}

            </div>
        </>
    );

}

export default Announcements;