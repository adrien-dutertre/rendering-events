import { Component, Host, inject, OnDestroy, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { findIndex, Subscription } from 'rxjs';
import { JsonPipe, NgStyle } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [NgStyle],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  liste: Evenement[] = [];
  subscriptionService!: Subscription;
  private dataService = inject(DataService);
  heures: string[] = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00"
  ];

  ngOnInit(): void {
    this.subscriptionService = this.dataService.getData().subscribe(event =>{
      this.affichageEvenements(event);
    });
  }

  ngOnDestroy(): void {
    this.subscriptionService.unsubscribe();
  }
  
  // Algorithme de positionnement et calcul de taille des évènements
  affichageEvenements(listeEvenements: any):void {
    // 1. Tri des évènements par horaire de début
    this.triListe(listeEvenements).forEach((element: any) => {
      const evenement = new Evenement();
      evenement.objet = element;

      // 1.1 Définition de l'heure de début en fonction du premier créneau de l'heure
      const heureDebut = this.convertirHeureDebut(element.start)-this.convertirHeureDebut(this.heures[0]);
      evenement.debut = heureDebut;
      evenement.fin = heureDebut + element.duration;

      this.liste.push(evenement);
    });

    // 2. Pour chaque évènement
    // 2.1 Déterminer lesquels sont en même temps
    this.liste.forEach(evenement => {
      evenement.enParallele = this.evenementsEnParalleles(evenement);
      // 2.2 Dans ces évènements parallèles, y'en-a-t-il avant l'horaire de début de notre évènement ?
      //     Filtrer les évènements en parallèle qui débutent avant notre évènement
      evenement.enParalleleAvant = evenement.enParallele.filter(event => {
        return event.debut <= evenement.debut;
      });

      // 2.3 Déterminer la position en colonne de notre évènement
      //     Créer un tableau de la taille des évènements avant
      //     Position les évènements dans leurs colonnes respectives, puis trouver l'emplacement vide => position de l'évènement
      const tablePosition: number[] = new Array(evenement.enParalleleAvant.length + 1).fill(null);
      evenement.enParalleleAvant.forEach(event => {
        const position: number = event.position;
        tablePosition[position] = position;
      });
      evenement.position = tablePosition.findIndex( x => {
        return x === null;
      });
    });
  
    // 2.4 Position de l'évènement
    this.liste.forEach(evenement => {
      evenement.max = this.maxTaille(evenement);
      evenement.cssLeft = this.positionElement(evenement);
    });

    // 2.5 Largeur de l'évènement
    this.liste.forEach(evenement => {
      evenement.cssWidth = this.tailleElement(evenement);
    });
  }
  
  // Calcul des horaires de début et de fin pour chaque évènement
  triListe(listeEvenement: any): any[] {
    return listeEvenement.sort((a: any, b: any) => {
      return this.convertirHeureDebut(a.start) - this.convertirHeureDebut(b.start);
    });
  }

  // Convertir l'heure du début pour pouvoir être utilisée
  convertirHeureDebut(heure: string): number {
    const conversion : string[] = heure.split(":");
    return Number(conversion[0]) * 60 + Number(conversion[1]);
  }

  
  // Si l'horaire de début de l'évènement et l'horaire de fin est compris entre l'horaire de début et fin d'un autre évènement
  evenementsEnParalleles(evenement: Evenement): Evenement[] {
    const heureDebut = evenement.debut;
    const heureFin = evenement.fin;
    const evenementEnParallele : Evenement[] = [];
    this.liste.forEach(element => {
      if (evenement.objet.id != element.objet.id) {
        if ((heureFin > element.debut) && (element.fin > heureDebut)) {
          evenementEnParallele.push(element);
        }
      }
    });
    return evenementEnParallele;
  }
  
  // Déterminer le nombre de colonne max
  maxTaille(evenement: Evenement): number {
    const maxElements : number[] = [];
    maxElements.push(evenement.position);
    maxElements.push(evenement.max);
    evenement.enParallele?.forEach(e => {
      maxElements.push(e.position);
      maxElements.push(e.max);
    });

    return Math.max(...maxElements);
  }

  // Déterminer la position de l'évènement
  positionElement(evenement: Evenement): string {
    return `calc(${evenement.position}*(100% / ${evenement.max + 1}))`
  }
  
  // Déterminer s'il a des espaces vides qui peuvent être occupés par l'évènement
  tailleElement(evenement: Evenement): string {
    let taille: number = 1;
    // Création du tableau
    const tableTaille : number[] = new Array(evenement.max + 1).fill(null);
    tableTaille[evenement.position] = evenement.position;
    evenement.enParallele?.forEach(e => {
      tableTaille[e.position] = e.position;
    });

    // Déterminer s'il y a un espace à côté de notre évènement
    for (let i: number = (evenement.position + 1); i < tableTaille.length; i++) {
      if (tableTaille[i] != null) {
        break;
      } else {
        taille++;
      }
    }
    return `calc(${taille}*(100% / ${evenement.max + 1}))`;
  }

}

export class Evenement {
  objet: any;
  debut: number = 0;
  fin: number = 0;
  enParallele?: Evenement[];
  enParalleleAvant?: Evenement[];
  position: number = 0;
  max: number = 0;
  cssLeft?: string;
  cssWidth?: string;
}