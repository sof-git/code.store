import { Controller, Get, Param } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { IResponse } from './movies.interface';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  /**
   * @description
   * This method is used to fetch popular movies from the API
   * @returns {Promise<IMovie[]>}
   * @memberof MoviesController
   */

  @Get()
  getMovies(): Promise<IResponse> {
    return this.moviesService.getMovies();
  }

  /**
   * @description
   * This method is used to fetch a movie by its title
   * @param {string} title
   * @returns {Promise<IMovie>}
   * @memberof MoviesController
   */

  @Get(':id')
  getMovie(@Param('id') id: number): Promise<IResponse> {
    return this.moviesService.getMovie(id);
  }
}
