import { useEffect, useState } from "react";

import api from "../services/api";
import Navbar from "../components/Navbar";

function Users() {

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        fetchUsers();

    }, []);

    const fetchUsers = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await api.get(
                "/auth/users",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setUsers(response.data);

        } catch (error) {

            console.error(error);
        }
    };

    const deleteUser = async (userId) => {

        if (
            !window.confirm(
                "Delete this user?"
            )
        ) {
            return;
        }

        try {

            const token =
                localStorage.getItem("token");

            await api.delete(
                `/auth/users/${userId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setUsers(
                users.filter(
                    (user) =>
                        user.id !== userId
                )
            );

        } catch (error) {

            console.error(error);

            alert(
                "Delete failed"
            );
        }
    };

    const toggleRole = async (userId) => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await api.put(
                `/auth/users/${userId}/role`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setUsers(
                users.map((user) =>
                    user.id === userId
                        ? {
                              ...user,
                              role:
                                  response.data.role
                          }
                        : user
                )
            );

        } catch (error) {

            console.error(error);

            alert(
                "Role update failed"
            );
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                ) ||
            user.roll_no
                .toLowerCase()
                .includes(
                    search.toLowerCase()
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
                    Users (
                    {filteredUsers.length}
                    )
                </h1>

                <input
                    type="text"
                    placeholder="Search by name or roll number"
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom:
                            "20px",
                        borderRadius:
                            "8px",
                        border:
                            "1px solid #444"
                    }}
                />

                {filteredUsers.length ===
                0 ? (

                    <div
                        style={{
                            textAlign:
                                "center",
                            padding:
                                "30px"
                        }}
                    >
                        <h3>
                            No users found
                        </h3>
                    </div>

                ) : (

                    filteredUsers.map(
                        (user) => (

                            <div
                                key={
                                    user.id
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

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center"
                                    }}
                                >

                                    <div>

                                        <h3>
                                            {
                                                user.name
                                            }
                                        </h3>

                                        <p>
                                            Roll
                                            No:
                                            {" "}
                                            {
                                                user.roll_no
                                            }
                                        </p>

                                        <p>
                                            Role:

                                            <span
                                                style={{
                                                    marginLeft:
                                                        "8px",
                                                    padding:
                                                        "4px 10px",
                                                    borderRadius:
                                                        "20px",
                                                    backgroundColor:
                                                        user.role ===
                                                        "admin"
                                                            ? "#ec4899"
                                                            : "#10b981",
                                                    color:
                                                        "#fff",
                                                    fontSize:
                                                        "12px",
                                                    fontWeight:
                                                        "bold"
                                                }}
                                            >
                                                {
                                                    user.role
                                                }
                                            </span>

                                        </p>

                                    </div>

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            gap:
                                                "10px"
                                        }}
                                    >

                                        <button
                                            onClick={() =>
                                                toggleRole(
                                                    user.id
                                                )
                                            }
                                        >
                                            {user.role ===
                                            "admin"
                                                ? "⬇ Make Student"
                                                : "⬆ Make Admin"}
                                        </button>

                                        {user.role !==
                                            "admin" && (

                                            <button
                                                onClick={() =>
                                                    deleteUser(
                                                        user.id
                                                    )
                                                }
                                            >
                                                🗑 Delete
                                            </button>

                                        )}

                                    </div>

                                </div>

                            </div>

                        )
                    )

                )}

            </div>
        </>
    );
}

export default Users;