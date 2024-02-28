import { Client } from "pushrelay/data/models/Client";
import { ServiceError, ServiceException } from "pushrelay/rpc/errors";

type Callback = (clientId: string, lang: string) => void;

export async function forAllClients(nodeName: string, callback: Callback): Promise<void> {
    const clients: Client[] = await Client.findAll({where: {nodeName}});
    if (clients.length === 0) {
        throw new ServiceException(ServiceError.NO_CLIENTS);
    }
    clients.forEach(client => callback(client.clientId, client.lang ?? "en"));
}
