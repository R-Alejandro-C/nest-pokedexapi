import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { error } from 'console';


@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>) {

  }
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    } catch (error) {

      this.handleExceptions(error)


    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    let pokemon: Pokemon | null = null;

    // Buscar por "no"
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: Number(term) });
    }



    //Buscar por nombre

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    //Buscar por id Mongoose


    if (!pokemon && isValidObjectId(term)) {

      pokemon = await this.pokemonModel.findById(term)
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemin con el ID ${term} no fue encontrado`)
    }

    return pokemon

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term)




    try {
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase()
      }

      await pokemon.updateOne(updatePokemonDto)

      return { ...pokemon.toJSON(), ...updatePokemonDto }
    } catch (error) {

      this.handleExceptions(error)
    }

  }

  async remove(term: string) {

    // const pokemon = await this.findOne(term)
    // await pokemon.deleteOne()

    // return `El pokemon #${pokemon.name} fue eliminado`;

    //    const result = (await this.findOne(term)).deleteOne()
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: term })

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon con el id ${term} no fue encontrado`)
    }
    return `El pokemon con ID ${term} se elimino correctamente`;
  }




  private handleExceptions(error: any) {

    if (error.code === 11000) {
      throw new HttpException(`el pokemon existe en la DB ${JSON.stringify(error.keyValue)}`, HttpStatus.BAD_REQUEST)
    } else {
      console.log(error)
      throw new HttpException(`Algo salio mal: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR)

    }
  }
}



