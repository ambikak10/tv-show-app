import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { IShow, IEpisode } from './ishow';
import { map } from 'rxjs/operators';
import { Ishowservice } from './ishowservice';


interface IShowData {
  id: number,
  name: string,
  summary: string,
  image: {
    medium: string
  },
  rating: {
    average: number
  },
 premiered: string,
 language: string,
 genres: string[],
 network: {
   name: string
 },
 schedule: {
   time: string,
   days: string[]
 },
 _embedded:{
    seasons:[
      {
     id : number
      }
   ],


    cast: [
      {
      person: {
         name: string
        }
      }
    ]
 }
}


 interface IEpisodeData {
  id: number;
  name: string;
  number: number | null;
  image: {
    medium: string,
    original: string
  };
  summary: string;
  season: number
 }

@Injectable({
  providedIn: 'root'
})
export class TvshowService implements Ishowservice{

  constructor(private httpclient: HttpClient) { }

  getTvShow(id : number) {
    return this.httpclient.get<IShowData>(
      `${environment.baseUrl}api.tvmaze.com/shows/${id}?embed[]=seasons&embed[]=cast`).pipe(map(data=> this.
        transformToIShows(data))
      )
    }
  transformToIShows(data: IShowData) : IShow {
   return {
    id: data.id,
    name: data.name,
    description: data.summary,
    image: data.image.medium,
    rating: data.rating ? data.rating.average : null,
    language: data.language,
    genres: data.genres,
    network: data.network? data.network.name : null,
    time: data.schedule.time,
    days: data.schedule.days,
    year: data.premiered,
    seasons: data._embedded? this.transformToSeasons(data._embedded.seasons) : null,
    cast: data._embedded? this.transformToCast(data._embedded.cast) : null
   }
  }

  transformToCast(data: Array<{person: {name: string}}>): string[] {
    return  data.map(value=> value.person.name);
  }
  transformToSeasons(data: [{ id: number }]): number[] {
      return data.map(value=> value.id);
    }

  transformToIEpisode(data: IEpisodeData) : IEpisode {
    return ({
      id: data.id,
      name: data.name,
      season: data.season,
      episode: data.number,
      image: data.image? data.image.medium: '',
      description: data.summary
    });
  }

  transfromToIEpisodeList(data: IEpisodeData[]): IEpisode[] {
    return data.map(d => this.transformToIEpisode(d));
  }

  //Get list of IEpisode from API by season ID
  getIEpisodeList(seasonId: number) {
    const url = `http://api.tvmaze.com/seasons/${seasonId}/episodes`;
    return this.httpclient.get<IEpisodeData[]>(url)
    .pipe(map(data => this.transfromToIEpisodeList(data)))
  }

  getAllShows() {
    const url = `http://api.tvmaze.com/shows`;
    return this.httpclient.get<IShowData[]>(url)
    .pipe(map(data => data.map(d => this.transformToIShows(d))))
  }
}










