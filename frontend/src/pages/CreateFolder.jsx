import { useEffect, useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateFolder() {

    const user = JSON.parse(
    localStorage.getItem("user")
    );

    if (user?.role !== "admin") {
    return <h2>Access Denied</h2>;
    }

    const [folderName, setFolderName] =
        useState("");

    const [subjects, setSubjects] =
        useState([]);

    const [folders, setFolders] =
        useState([]);

    const [subjectId, setSubjectId] =
        useState("");

    const [parentFolderId,
        setParentFolderId] =
        useState("");

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

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const token =
                localStorage.getItem("token");

            await api.post(
                "/folders",
                {
                    folder_name: folderName,
                    subject_id: subjectId,
                    parent_folder_id:
                        parentFolderId || null
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            alert("Folder created");

            setFolderName("");

        } catch (error) {

    console.error(error);

    console.log(error.response);

    alert(
        error.response?.data?.error ||
        error.message
    );
}
    };

    return (
        <>
            <Navbar />

            <div style={{ padding: "20px" }}>

                <h1>Create Folder</h1>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Folder Name"
                        value={folderName}
                        onChange={(e) =>
                            setFolderName(
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
                        value={parentFolderId}
                        onChange={(e) =>
                            setParentFolderId(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            No Parent Folder
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

                    <button type="submit">
                        Create Folder
                    </button>

                </form>

            </div>
        </>
    );
}

export default CreateFolder;