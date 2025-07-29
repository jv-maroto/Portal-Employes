import React, { createContext, useContext, useState, useEffect } from "react";

const PostContext = createContext();
export const ViewsContext = createContext({ showViews: false, setShowViews: () => {} })

export const PostProvider = ({ children }) => {
    const [postsData, setPostsData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [filter, setFilter] = useState('all');
    const [availableYears, setAvailableYears] = useState([]);


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/posts/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error al obtener los posts: ${response.statusText}`);
                }

                const data = await response.json();
                setPostsData(data);
            } catch (error) {
                console.error("Error al obtener los posts:", error);
            }
        };

        fetchPosts();
    }, [selectedYear, filter]);

    const filteredPosts = postsData.filter(
        (post) => filter === 'all' || post.type === filter
    );

    return (
        <PostContext.Provider
            value={{
                postsData,
                filteredPosts,
                selectedYear,
                setSelectedYear,
                filter,
                setFilter,
                availableYears,

            }}
        >
            {children}
        </PostContext.Provider>
    );
};

export const usePostContext = () => useContext(PostContext);
export const useViews = () => useContext(ViewsContext)
