// @ts-nocheck
import fetch from "node-fetch";
import { graphql, buildSchema } from "graphql";
import { countTotalProposals } from "./totalOfGobernan";

// Resolver para obtener los votos basados en el voter específico
const root = {
    votes: async ({ voter }) => {
        const query = `
      query Votes {
        votes (
          first: 1000
          where: {
            voter: "${voter}"
            space_in: ["arbitrumfoundation.eth"]
          }
        ) {
          id
          voter
          created
          choice
          space {
            id
          }
        }
      }
    `;

        const url = `https://hub.snapshot.org/graphql?operationName=Votes&query=${encodeURIComponent(
            query
        )}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.data.votes;
    },
};

// Función para contar la cantidad de votos
export async function countVotes(WALLET_ADDRESS) {
    const voterAddress = WALLET_ADDRESS;

    try {
        const votes = await root.votes({ voter: voterAddress });
        const voteCount = votes.length;
        //console.log(`El votante ${voterAddress} ha votado ${voteCount} veces.`);
        return voteCount;
    } catch (error) {
        console.error(error);
    }
}

export async function countPercentageVotes(WALLET_ADDRESS) {
    const voted = await countVotes(WALLET_ADDRESS);
    const total = await countTotalProposals();

    return (100.0 * voted) / total;
}

// Ejecutar la función para contar los votos
//countVotes();
