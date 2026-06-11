import { useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";

function CreateSubject() {

const [name, setName] = useState("");

const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        const token =
            localStorage.getItem("token");

        await api.post(
            "/subjects",
            {
                name
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        alert("Subject created");

        setName("");

    } catch (error) {

        console.error(error);

        alert("Failed to create subject");
    }
};

return (
    <>
        <Navbar />

        <div style={{ padding: "20px" }}>

            <h1>Create Subject</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Subject Name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />

                <br /><br />

                <button type="submit">
                    Create Subject
                </button>

            </form>

        </div>
    </>
);

}

export default CreateSubject;
