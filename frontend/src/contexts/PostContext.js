import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

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
                const response = await api.get("posts/");
                setPostsData(response.data);
            } catch (error) {
                // Error silenciado en producción
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
