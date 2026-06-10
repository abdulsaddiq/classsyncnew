import { useEffect, useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateAssignment() {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subjectId, setSubjectId] = useState("");

    const [subjects, setSubjects] = useState([]);

    useEffect(() => {

        fetchSubjects();

    }, []);

    const fetchSubjects = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await api.get(
                "/subjects",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setSubjects(
                response.data
            );

        } catch (error) {

            console.error(error);
        }
    };

    const createAssignment = async () => {

        try {

            const token =
                localStorage.getItem("token");

            await api.post(
                "/assignments",
                {
                    title,
                    description,
                    subject_id: subjectId
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert(
                "Assignment created"
            );

            setTitle("");
            setDescription("");
            setSubjectId("");

        } catch (error) {

            console.error(error);

            alert(
                "Failed to create assignment"
            );
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ padding: "20px" }}>

                <h1>
                    Create Assignment
                </h1>

                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) =>
                        setTitle(e.target.value)
                    }
                />

                <br /><br />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) =>
                        setDescription(
                            e.target.value
                        )
                    }
                />

                <br /><br />

                <select
                    value={subjectId}
                    onChange={(e) =>
                        setSubjectId(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        Select Subject
                    </option>

                    {subjects.map(
                        (subject) => (
                            <option
                                key={subject.id}
                                value={subject.id}
                            >
                                {subject.name}
                            </option>
                        )
                    )}
                </select>

                <br /><br />

                <button
                    onClick={
                        createAssignment
                    }
                >
                    Create Assignment
                </button>

            </div>
        </>
    );
}

export default CreateAssignment;