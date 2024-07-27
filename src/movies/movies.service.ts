import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IMovie } from './movies.interface';

@Injectable()
export class MoviesService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * @description
   * This method is used to fetch all popular movies from the API
   * @returns {Promise<IMovie[]>}
   */

  async getMovies(): Promise<IMovie[]> {
    const headers = {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    };

    const request = this.httpService.get(
      `https://api.themoviedb.org/3/movie/popular`,
      { headers },
    );
    const response = await lastValueFrom(request);
    const movies: IMovie[] = response.data.results;
    return movies;
  }

  /**
   * @description
   * This method is used to fetch a movie by its title
   * @param {string} title
   * @returns {Promise<IMovie>}
   */

  async getMovie(id: number): Promise<IMovie> {
    const headers = {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    };
    console.log(id);

    const request = this.httpService.get(
      `https://api.themoviedb.org/3/movie/${id}`,
      { headers },
    );
    const response = await lastValueFrom(request);
    console.log(response.data);
    const movie: IMovie = response.data;
    return movie;
  }
}
