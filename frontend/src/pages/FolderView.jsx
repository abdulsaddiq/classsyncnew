import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";

function FolderView() {

    const { id } = useParams();

    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [role, setRole] = useState("");

    useEffect(() => {

        const user = JSON.parse(
            localStorage.getItem("user")
        );

        if (user) {
            setRole(user.role);
        }

        const fetchFiles = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await api.get(
                    `/folders/${id}/files`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setFiles(response.data);

            } catch (error) {

                console.error(error);
            }
        };

        const fetchChildFolders = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await api.get(
                    `/folders/${id}/children`,
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

        fetchFiles();
        fetchChildFolders();

    }, [id]);

    const deleteFile = async (fileId) => {

        if (
            !window.confirm(
                "Delete this file?"
            )
        ) {
            return;
        }

        try {

            const token =
                localStorage.getItem("token");

            await api.delete(
                `/files/${fileId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setFiles(
                files.filter(
                    file => file.id !== fileId
                )
            );

        } catch (error) {

            console.error(error);

            alert("Delete failed");
        }
    };

    const deleteFolder = async (folderId) => {

        if (
            !window.confirm(
                "Delete this folder?"
            )
        ) {
            return;
        }

        try {

            const token =
                localStorage.getItem("token");

            await api.delete(
                `/folders/${folderId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setFolders(
                folders.filter(
                    folder =>
                        folder.id !== folderId
                )
            );

        } catch (error) {

            console.error(error);

            alert("Delete failed");
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ padding: "20px" }}>

                <h1>Folder</h1>

                <h2>Folders</h2>

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
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <Link to={`/folder/${folder.id}`}>
                                📁 {folder.folder_name}
                            </Link>

                            {role === "admin" && (
                                <button
                                    onClick={() =>
                                        deleteFolder(folder.id)
                                    }
                                >
                                    🗑 Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                <h2>Files</h2>

                {files.map((file) => (
                    <div
                        key={file.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            borderRadius: "10px",
                            marginBottom: "10px"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <a
                                href={`${import.meta.env.VITE_API_URL}/files/view/${file.id}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                📄 {file.file_name}
                            </a>

                            {role === "admin" && (
                                <button
                                    onClick={() =>
                                        deleteFile(file.id)
                                    }
                                >
                                    🗑 Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}

            </div>
        </>
    );
}

export default FolderView;