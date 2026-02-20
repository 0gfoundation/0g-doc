import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";

async function main() {
  const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");

  // Step 1: Create a wallet with a private key
  const privateKey =
    "Please input your private key, and make sure it has enough testnet 0GAI token";
  const wallet = new ethers.Wallet(privateKey, provider);

  // Step 2: Initialize the broker
  try {
    const broker = await createZGComputeNetworkBroker(wallet);

    // Step 3: List available services
    console.log("Listing available services...");
    const services = await broker.inference.listService();
    services.forEach((service: any) => {
      console.log(
        `Service: ${service.name}, Provider: ${service.provider}, Type: ${service.serviceType}, Model: ${service.model}, URL: ${service.url}`
      );
    });

    // Step 3.1: Select a service
    const service = services.find(
      (service: any) => service.name === "Please input the service name"
    );
    if (!service) {
      console.error("Service not found.");
      return;
    }
    const providerAddress = service.provider;

    // Step 4: Manage Accounts
    console.log("Depositing funds...");
    await broker.ledger.depositFund(10);
    console.log("Funds deposited successfully.");

    // Step 4.1: Get the account
    const account = await broker.ledger.getLedger();
    console.log(account);

    // Step 5: Use the Provider's Services
    console.log("Processing a request...");
    const content = "Please input your message here";

    // Step 5.1: Get the request metadata
    const { endpoint, model } = await broker.inference.getServiceMetadata(
      providerAddress
    );

    // Step 5.2: Get the request headers
    const headers = await broker.inference.getRequestHeaders(
      providerAddress
    );

    // Step 6: Send a request to the service
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: "",
    });
    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "system", content }],
        model: model,
      },
      {
        headers: {
          ...headers,
        },
      }
    );

    const receivedContent = completion.choices[0].message.content;
    const chatID = completion.id;
    if (!receivedContent) {
      throw new Error("No content received.");
    }
    console.log("Response:", receivedContent);

    // Step 7: Process the response
    console.log("Processing a response...");
    const isValid = await broker.inference.processResponse(
      providerAddress,
      chatID,
      JSON.stringify(completion.usage)
    );
    console.log(`Response validity: ${isValid ? "Valid" : "Invalid"}`);
  } catch (error) {
    console.error("Error during execution:", error);
  }
}

main();
