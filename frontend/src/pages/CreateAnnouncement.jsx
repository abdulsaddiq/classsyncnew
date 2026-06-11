import { useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateAnnouncement() {


const [title, setTitle] = useState("");
const [content, setContent] = useState("");

const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        const token =
            localStorage.getItem("token");

        await api.post(
            "/announcements",
            {
                title,
                content
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        alert(
            "Announcement created"
        );

        setTitle("");
        setContent("");

    } catch (error) {

        console.error(error);

        alert(
            "Failed to create announcement"
        );
    }
};

return (
    <>
        <Navbar />

        <div style={{ padding: "20px" }}>

            <h1>Create Announcement</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) =>
                        setTitle(e.target.value)
                    }
                />

                <br /><br />

                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) =>
                        setContent(e.target.value)
                    }
                />

                <br /><br />

                <button type="submit">
                    Create
                </button>

            </form>

        </div>
    </>
);

}

export default CreateAnnouncement;
