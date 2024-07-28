import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { IMovie, IResponse } from './movies.interface';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import * as https from 'https';

@Injectable()
export class MoviesService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * @description
   * This method is used to fetch all popular movies from the API
   * @returns {Promise<jsPDF>}
   */

  async getMovies(): Promise<IResponse> {
    const headers = {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    };

    // Fetching the popular movies from the API
    const request = this.httpService.get(
      `https://api.themoviedb.org/3/movie/popular`,
      { headers },
    );

    // Extracting the movies from the response
    const response = await lastValueFrom(request);
    const movies: IMovie[] = response.data.results;

    const doc: jsPDF = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Setting the title font style
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(69, 192, 197);
    doc.text('Popular Movies', 10, 10);

    const baseURL = 'https://www.themoviedb.org/movie/';

    // Fetching the movie posters
    const fetchPosterPromises = movies.map(async (movie, index) => {
      const response = await lastValueFrom(
        this.httpService.get(
          `https://api.themoviedb.org/3/movie/${movie.id}/images`,
          { headers },
        ),
      );
      const posterPath = response.data.posters[0]?.file_path;

      if (posterPath) {
        const posterUrl = `https://image.tmdb.org/t/p/original${posterPath}`;
        const posterResponse = await axios.get(posterUrl, {
          responseType: 'arraybuffer',
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        });
        const posterBuffer = Buffer.from(posterResponse.data, 'binary');
        const base64data = posterBuffer.toString('base64');

        doc.addImage(
          `data:image/jpeg;base64,${base64data}`,
          'JPEG',
          10,
          20 + index * 60,
          30,
          45,
        );

        const movieTitleLink = `${index + 1}. ${movie.title}`;
        const movieUrl = `${baseURL}${movie.id}`;

        // Setting the movie title font style and adding a link to the movie
        doc.setTextColor(0, 0, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.textWithLink(movieTitleLink, 50, 35 + index * 60, {
          url: movieUrl,
        });
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'italic');
        doc.text(`Release Date: ${movie.release_date}`, 50, 45 + index * 60);
        doc.text(`Rating: ${movie.vote_average}`, 50, 55 + index * 60);
        doc.line(10, 65 + index * 60, 200, 65 + index * 60);
      }
    });

    await Promise.all(fetchPosterPromises);

    doc.save('popular_movies.pdf');
    return {
      response: 'file saved !',
      data: movies,
      error: null,
    };
  }

  /**
   * @description
   * This method is used to fetch a movie by its title
   * @param {string} title
   * @returns {Promise<IMovie>}
   */

  async getMovie(id: number): Promise<IResponse> {
    const headers = {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    };

    const request = this.httpService.get(
      `https://api.themoviedb.org/3/movie/${id}`,
      { headers },
    );
    const response = await lastValueFrom(request);
    const movie: IMovie = response.data;

    // Fetching the movie poster
    const posterResponse = await lastValueFrom(
      this.httpService.get(`https://api.themoviedb.org/3/movie/${id}/images`, {
        headers,
      }),
    );
    const posterPath = posterResponse.data.posters[0]?.file_path;

    if (posterPath) {
      const posterUrl = `https://image.tmdb.org/t/p/original${posterPath}`;
      const posterResponse = await axios.get(posterUrl, {
        responseType: 'arraybuffer',
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });
      const posterBuffer = Buffer.from(posterResponse.data, 'binary');
      const base64data = posterBuffer.toString('base64');

      //generate PDF with movie details
      const doc: jsPDF = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(69, 192, 197);
      doc.text(movie.title, 50, 20);
      doc.setTextColor(0, 0, 0);
      doc.text(`Release Date: ${movie.release_date}`, 50, 40);
      doc.text(`Rating: ${movie.vote_average}`, 50, 50);
      doc.addImage(
        `data:image/jpeg;base64,${base64data}`,
        'JPEG',
        10,
        20,
        30,
        45,
      );
      doc.save('movie_details.pdf');
    } else {
      return {
        response: 'error',
        data: null,
        error: 'No poster found',
      };
    }
    return {
      response: 'file saved !',
      data: movie,
      error: null,
    };
  }
}
