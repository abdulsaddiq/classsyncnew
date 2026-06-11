import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";

function SubjectPage() {

    const { id } = useParams();

    const [folders, setFolders] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {

        const fetchFolders = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await api.get(
                    `/subjects/${id}/folders`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setFolders(response.data);

            } catch (error) {

                console.error(error);
            }
        };

        const fetchAssignments = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await api.get(
                    `/assignments/subject/${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setAssignments(
                    response.data
                );

            } catch (error) {

                console.error(error);
            }
        };

        fetchFolders();
        fetchAssignments();

    }, [id]);

    const getDaysLeft = (dueDate) => {

        if (!dueDate) {
            return null;
        }

        const today = new Date();

        const due = new Date(dueDate);

        const diff =
            Math.ceil(
                (
                    due - today
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );

        return diff;
    };

    const filteredFolders = folders.filter(
        (folder) =>
            folder.folder_name
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
    );

    return (
        <>
            <Navbar />

            <div
                style={{
                    padding: "20px"
                }}
            >

                <h1>
                    Subject
                </h1>

                <h2>
                    📁 Folders
                </h2>

                <input
                    type="text"
                    placeholder="🔍 Search folders..."
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(
                            e.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "15px",
                        borderRadius: "8px",
                        border: "1px solid #ccc"
                    }}
                />

                {filteredFolders.length === 0 ? (

                    <p>
                        📁 No folders found
                    </p>

                ) : (

                    filteredFolders.map(
                        (folder) => (

                            <div
                                key={folder.id}
                                style={{
                                    border:
                                        "1px solid #ddd",
                                    padding:
                                        "15px",
                                    borderRadius:
                                        "10px",
                                    marginBottom:
                                        "10px"
                                }}
                            >
                                <Link
                                    to={`/folder/${folder.id}`}
                                >
                                    📁 {folder.folder_name}
                                </Link>
                            </div>

                        )
                    )

                )}

                <h2>
                    📝 Assignments
                </h2>

                {assignments.length === 0 ? (

                    <p>
                        No assignments yet.
                    </p>

                ) : (

                    assignments.map(
                        (assignment) => {

                            const daysLeft =
                                getDaysLeft(
                                    assignment.due_date
                                );

                            return (

                                <div
                                    key={
                                        assignment.id
                                    }
                                    style={{
                                        border:
                                            "1px solid #ddd",
                                        padding:
                                            "15px",
                                        borderRadius:
                                            "10px",
                                        marginBottom:
                                            "10px"
                                    }}
                                >

                                    <h3>
                                        {
                                            assignment.title
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
                                            assignment.created_by
                                        }
                                    </p>

                                    <p>
                                        {
                                            assignment.description
                                        }
                                    </p>

                                    {assignment.due_date && (

                                        <>
                                            <p>
                                                📅 Due:{" "}
                                                {
                                                    assignment.due_date
                                                }
                                            </p>

                                            <p>

                                                {daysLeft < 0 ? (

                                                    <span
                                                        style={{
                                                            color:
                                                                "red",
                                                            fontWeight:
                                                                "bold"
                                                        }}
                                                    >
                                                        ❌ Overdue
                                                    </span>

                                                ) : (

                                                    <span
                                                        style={{
                                                            color:
                                                                "green",
                                                            fontWeight:
                                                                "bold"
                                                        }}
                                                    >
                                                        ⏳ {daysLeft} days left
                                                    </span>

                                                )}

                                            </p>
                                        </>

                                    )}

                                </div>

                            );
                        }
                    )

                )}

            </div>
        </>
    );

}

export default SubjectPage;