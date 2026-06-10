import { useEffect, useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";

function UploadFile() {

    const user = JSON.parse(
    localStorage.getItem("user")
    );

    if (user?.role !== "admin") {
    return <h2>Access Denied</h2>;
    }

    const [subjects, setSubjects] =
        useState([]);

    const [folders, setFolders] =
        useState([]);

    const [subjectId, setSubjectId] =
        useState("");

    const [folderId, setFolderId] =
        useState("");

    const [file, setFile] =
        useState(null);

    useEffect(() => {

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

                setSubjects(response.data);

            } catch (error) {

                console.error(error);
            }
        };

        fetchSubjects();

    }, []);

    useEffect(() => {

        if (!subjectId) return;

        const fetchFolders = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await api.get(
                    `/folders/subject/${subjectId}`,
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

        fetchFolders();

    }, [subjectId]);

    const handleUpload = async (e) => {

        e.preventDefault();

        try {

            const token =
                localStorage.getItem("token");

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "folder_id",
                folderId
            );

            await api.post(
                "/files/upload",
                formData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert("File uploaded");

        } catch (error) {

            console.error(error);

            alert("Upload failed");
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ padding: "20px" }}>

                <h1>Upload File</h1>

                <form onSubmit={handleUpload}>

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

                        {subjects.map((subject) => (
                            <option
                                key={subject.id}
                                value={subject.id}
                            >
                                {subject.name}
                            </option>
                        ))}
                    </select>

                    <br /><br />

                    <select
                        value={folderId}
                        onChange={(e) =>
                            setFolderId(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            Select Folder
                        </option>

                        {folders.map((folder) => (
                            <option
                                key={folder.id}
                                value={folder.id}
                            >
                                {folder.folder_name}
                            </option>
                        ))}
                    </select>

                    <br /><br />

                    <input
                        type="file"
                        onChange={(e) =>
                            setFile(
                                e.target.files[0]
                            )
                        }
                    />

                    <br /><br />

                    <button type="submit">
                        Upload
                    </button>

                </form>

            </div>
        </>
    );
}

export default UploadFile;