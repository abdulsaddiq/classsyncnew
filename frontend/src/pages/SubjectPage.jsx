import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";

function SubjectPage() {

    const { id } = useParams();

    const [folders, setFolders] = useState([]);
    const [assignments, setAssignments] = useState([]);

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

    return (
        <>
            <Navbar />

            <div style={{ padding: "20px" }}>

                <h1>Subject</h1>

                <h2>📁 Folders</h2>

                {folders.map((folder) => (

                    <div
                        key={folder.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            borderRadius: "10px",
                            marginBottom: "10px"
                        }}
                    >
                        <Link to={`/folder/${folder.id}`}>
                            📁 {folder.folder_name}
                        </Link>
                    </div>

                ))}

                <h2>📝 Assignments</h2>

                {assignments.map((assignment) => (

                    <div
                        key={assignment.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            borderRadius: "10px",
                            marginBottom: "10px"
                        }}
                    >

                        <h3>
                            {assignment.title}
                        </h3>

                        <p>
                            {assignment.description}
                        </p>

                    </div>

                ))}

            </div>
        </>
    );
}

export default SubjectPage;