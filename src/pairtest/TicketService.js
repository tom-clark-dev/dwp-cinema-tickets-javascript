import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService";

export default class TicketService {
    #totalCost;
    #noOfSeats;

    #maxTickets;
    #prices;

    constructor() {
        this.#maxTickets = this.#getMaxNoOfTickets();
        this.#prices = this.#getPrices();
        Object.freeze(this);
    }

    /**
     * Should only have private methods other than the one below.
     */

    purchaseTickets(accountId, ...ticketTypeRequests) {
        this.#checkOrderIsValid(accountId, ticketTypeRequests);

        this.#noOfSeats = this.#getTotalSeats(ticketTypeRequests);
        new SeatReservationService().reserveSeat(accountId, this.#noOfSeats);

        this.#totalCost = this.#getTotalCost(ticketTypeRequests);
        new TicketPaymentService().makePayment(accountId, this.#totalCost);

        return { noOfSeats: this.#noOfSeats, totalCost: this.#totalCost };
    }

    #checkOrderIsValid(accountId, ticketTypeRequests) {
        this.#checkAccountIdIsValid(accountId);
        this.#checkTicketRequestTypesAreValid(ticketTypeRequests);
        this.#checkTotalTicketsWithinMax(ticketTypeRequests);
        this.#checkTicketsIncludeAnAdult(ticketTypeRequests);
    }

    #checkAccountIdIsValid(accountId) {
        if (!accountId)
            throw new InvalidPurchaseException("Account ID required");

        if (!Number.isInteger(accountId) || accountId <= 0)
            throw new InvalidPurchaseException(
                "Account ID must be a postive whole number"
            );
    }

    #checkTicketRequestTypesAreValid(ticketTypeRequests) {
        if (ticketTypeRequests.length === 0)
            throw new InvalidPurchaseException("No ticket types provided");

        ticketTypeRequests.forEach((request) => {
            if (!(request instanceof TicketTypeRequest))
                throw new InvalidPurchaseException(
                    "Invalid ticket type provided"
                );
        });
    }

    #checkTotalTicketsWithinMax(ticketTypeRequests) {
        const totalTickets = ticketTypeRequests.reduce((sum, request) => {
            return request.getNoOfTickets() + sum;
        }, 0);

        if (totalTickets > this.#maxTickets)
            throw new InvalidPurchaseException(
                `Number of tickets ordered exceeds the maximum of ${
                    this.#maxTickets
                }`
            );
    }

    #checkTicketsIncludeAnAdult(ticketTypeRequests) {
        const totalAdults = ticketTypeRequests.reduce(
            (total, ticketRequest) => {
                if (ticketRequest.getTicketType() === "ADULT")
                    return ticketRequest.getNoOfTickets() + total;
                return total;
            },
            0
        );

        if (totalAdults === 0)
            throw new InvalidPurchaseException(
                "Cannot order child or infant tickets without ordering an adult ticket"
            );
    }

    #getTotalSeats(ticketTypeRequests) {
        return ticketTypeRequests.reduce((total, ticketRequest) => {
            if (ticketRequest.getTicketType() !== "INFANT")
                return ticketRequest.getNoOfTickets() + total;
            return total;
        }, 0);
    }

    #getTotalCost(ticketTypeRequests) {
        return ticketTypeRequests.reduce((total, ticketRequest) => {
            const ticketPrice = this.#prices[ticketRequest.getTicketType()];
            return ticketRequest.getNoOfTickets() * ticketPrice + total;
        }, 0);
    }

    #getPrices() {
        return {
            ADULT: 20,
            CHILD: 10,
            INFANT: 0,
        };
    }

    #getMaxNoOfTickets() {
        return 20;
    }
}
