// @ts-nocheck
import fetch from "node-fetch";
import fs from "fs";
import { createCache } from "./cache";

// Resolver para obtener todas las votaciones en el espacio específico
const root = {
    votes: async () => {
        const query = `
      query Proposals {
        proposals (
          first: 1000
          where: {
            space_in: ["arbitrumfoundation.eth"]
          }
        ) {
          id
          title
          body
          start
          end
          state
          author
          space {
            id
          }
        }
      }
    `;

        const url = `https://hub.snapshot.org/graphql?operationName=Proposals&query=${encodeURIComponent(
            query
        )}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.data.proposals;
    },
};

const getCount = async (): number => {
    const proposals = await root.votes();
    const proposalCount = proposals.length;
    return proposalCount
};

const proposalCache = createCache<number>(
    "arbSnapshotProposalCount",
    60 * 60 * 4,
    getCount
);

// Función para contar la cantidad total de tipos de votaciones
export async function countTotalProposals() {
  return proposalCache()
}

// Ejecutar la función para contar las votaciones
// countTotalProposals();
