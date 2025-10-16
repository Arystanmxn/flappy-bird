export type TBirdSkin = {
  name: string
  image: string
  width: number
  height: number
  displayWidth: number
  displayHeight: number
  collection: 'countries' | 'animals'
}

export const birdSkins: TBirdSkin[] = [
  {
    name: 'uzbekistan',
    image: 'assets/bird-skins/countries/UZ.svg',
    width: 280,
    height: 200,
    collection: 'countries',
    displayWidth: 28,
    displayHeight: 20,
  },
  {
    name: 'india',
    image: 'assets/bird-skins/countries/india.svg',
    width: 280,
    height: 200,
    collection: 'countries',
    displayWidth: 28,
    displayHeight: 20,
  },
  {
    name: 'ukraine',
    image: 'assets/bird-skins/countries/UA.svg',
    width: 280,
    height: 200,
    collection: 'countries',
    displayWidth: 28,
    displayHeight: 20,
  },
  {
    name: 'USA',
    image: 'assets/bird-skins/countries/US.svg',
    width: 280,
    height: 200,
    collection: 'countries',
    displayWidth: 28,
    displayHeight: 20,
  },
  {
    name: 'kazakhstan',
    image: 'assets/bird-skins/countries/KZ.svg',
    width: 280,
    height: 200,
    collection: 'countries',
    displayWidth: 28,
    displayHeight: 20,
  },
  {
    name: 'angelfish',
    image: 'assets/bird-skins/animals/angelfish.svg',
    width: 300,
    height: 300,
    displayWidth: 30,
    collection: 'animals',
    displayHeight: 30,
  },
  {
    name: 'bass',
    image: 'assets/bird-skins/animals/bass.svg',
    width: 300,
    height: 300,
    collection: 'animals',
    displayWidth: 30,
    displayHeight: 30,
  },
  {
    name: 'bat',
    image: 'assets/bird-skins/animals/bat.svg',
    width: 300,
    height: 300,
    collection: 'animals',
    displayWidth: 30,
    displayHeight: 30,
  },
  {
    name: 'butterfly',
    image: 'assets/bird-skins/animals/butterfly.svg',
    width: 300,
    height: 300,
    collection: 'animals',
    displayWidth: 30,
    displayHeight: 30,
  },
  {
    name: 'bee',
    image: 'assets/bird-skins/animals/bee.svg',
    width: 300,
    height: 300,
    collection: 'animals',
    displayWidth: 30,
    displayHeight: 30,
  },
  {
    name: 'blue whale',
    image: 'assets/bird-skins/animals/blue_whale.svg',
    width: 300,
    height: 300,
    collection: 'animals',
    displayWidth: 30,
    displayHeight: 30,
  },
]
