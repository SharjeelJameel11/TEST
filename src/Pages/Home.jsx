import React, { useState, useEffect } from 'react';
import './Home.css';
import { debounce } from 'lodash';

function Home() {
    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0)
    const API_KEY = "114f4a9a";


    const fetchMovies = async () => {
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${search}&page=${currentPage}`);
            const data = await res.json();
            console.log(res, "res");

            if (data.Response === "True") {
                setMovies(data.Search);
                setTotalResults(Number(data.totalResults))
                setError(false);
            } else {
                if (data.Error === "Too many results.") {
                    throw new Error("Too many results, please refine your search.");
                } else if (data.Error === "Movie not found!") {
                    throw new Error("No movies found, try searching with different terms.");
                } else {
                    throw new Error(data.Error || "An unknown error occurred");
                }
            }

        } catch (error) {
            setError(error.message)
            setMovies([])
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    console.log(error, "err")
    console.log(loading, "loading")

    const debouncedFetchMovies = debounce(fetchMovies, 1500);


    useEffect(() => {
        if (search.length > 0) {
            debouncedFetchMovies();
        }
        return () => debouncedFetchMovies.cancel();
    }, [search, currentPage]);
    const handlePageChange = (page) => {
        setCurrentPage(page);
        setLoading(true)
    
    };
    const totalPages = Math.ceil(totalResults / 10)
    const renderPagination = () => {
        const pages = [];
        const totalPages = Math.ceil(totalResults / 10);
        if (totalPages <= 6) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1, 2, 3, 4);
            if (currentPage > 5) {
                pages.push("...");
            }
            let startPage = Math.max(5, currentPage - 1);
            let endPage = Math.min(totalPages - 4, currentPage + 1);
    
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 4) {
                pages.push("...");
            }
            pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        }
    
        return pages.map((page, index) => 
            typeof page === "number" ? (
                <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`button ${currentPage === page ? "active" : ""}`}
                >
                    {page}
                </button>
            ) : (
                <span key={index} className="ellipsis">...</span>
            )
        );
    };
    
    return (
        <div className="container">
            <h1> Movie Search App</h1>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search Movies..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setLoading(e.target.value.length > 0); }}
                />
            </div>

            {loading ? (
                <div >
                    <img className="loading"
                        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHRxa2d3YzczOHEyemUzMTg1NGR2eGRxdm41MTA5bmJvcGJreThhbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uIJBFZoOaifHf52MER/giphy.gif"
                        width="300"
                        alt="Loading..."
                    />
                </div>
            )
                : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className={`movies-grid   `}>
                        {movies.map((movie) => (
                            <div key={movie.imdbID} className={`movie-card`}>
                                <img src={movie.Poster} alt={movie.Title} />
                                <h2>{movie.Title}</h2>
                                <p>{movie.Year}</p>
                            </div>
                        ))}
                    </div>

                )}

{movies.length > 0 && loading === false && (
    <div className="pagination">
        <button className="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
        </button>

        {renderPagination()}

        <button className="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
        </button>
    </div>
)}

           
        </div>
    );
}

export default Home;
