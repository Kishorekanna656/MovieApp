import React, {useState} from 'react'
import Search from "./Components/Search.jsx";
import { useEffect} from "react";
import Spinner from "./Components/Spinner.jsx";
import MovieCard from "./Components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: 'GET',
    headers: ({
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    })
}
function App() {
    const [searchTerm, setsearchTerm] = useState('');

    const [errorMessage, seterrorMessage] = useState('');

    const [moviesList, setMoviesList] = useState([]);

    const [isLoading, setIsLoading] = useState(false)

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [trengingMovies, setTrendingMovies] = useState([]);

    useDebounce(() => (setDebouncedSearchTerm(searchTerm)) ,500,[searchTerm])

    const fetchMovies = async (query = '') => {

        setIsLoading(true)
        seterrorMessage('')
        try{
            const endpoint = query ?  `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);
            if(!response.ok){
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();


            if(!Array.isArray(data.results)){
                seterrorMessage(data.results || 'Failed to fetch movies') ;
                setMoviesList([]);
                return;
            }
            setMoviesList(data.results || []);
            if(query && data.results.length > 0){
                await updateSearchCount(query, data.results[0]);
            }
        }catch(error){
            console.log(`Error fetching movies : ${error}`);
            seterrorMessage('Error fetching movies Please try again');
        }finally{
            setIsLoading(false);

        }
    }

    const loadTrendingMovies = async () => {
        try{
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        }catch(error){
            console.log(`Error fetching trending movies: ${error}`);
        }
    }
    useEffect(
        ()=>{
            fetchMovies(debouncedSearchTerm);
        }
   ,[debouncedSearchTerm] );

    useEffect(()=>{
        loadTrendingMovies();
    },[])

    return (
        <main>
            <div className="pattern" />
            <div className="wrapper">
                <header>
                    <img src="./hero-img.png" alt="Background Image"/>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle </h1>
                    <Search searchTerm={searchTerm} setsearchTerm={setsearchTerm} />
                </header>

                {trengingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>
                        <ul>
                            {trengingMovies.map((movie,index)=>(
                                <li key={movie.$id}>
                                    <p>{index+1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                <section className="all-movies">
                    <h2>All Movies</h2>
                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {moviesList.map((movie) => (
                                <MovieCard  key={movie.id} movie={movie}/>

                            ))}

                        </ul>
                    )}
                </section>

            </div>
        </main>
    )
}



export default App
