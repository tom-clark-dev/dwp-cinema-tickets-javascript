import { jest } from "@jest/globals";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../src/pairtest/TicketService";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService";

// Check definitions
describe("Check TicketService class", () => {
    test("is instantiable", () => {
        const ticketService = new TicketService();
        expect(ticketService).toBeInstanceOf(TicketService);
    });
    test("has method purchaseTickets", () => {
        const ticketService = new TicketService();
        expect(ticketService.purchaseTickets).toBeDefined();
    });
});

// Check service only accepts valid account ids
describe("Check purchaseTickets only accepts valid account ids", () => {
    test("should throw if not provided", () => {
        const purchaseTickets = () => {
            new TicketService().purchaseTickets();
        };
        expect(purchaseTickets).toThrow(InvalidPurchaseException);
    });
    test.each([null, true, undefined, "test", [], {}, 0, 0.5, -1])(
        "should throw if not a positive integer",
        (value) => {
            const purchaseTickets = () => {
                new TicketService().purchaseTickets(
                    value,
                    new TicketTypeRequest("ADULT", 1)
                );
            };
            expect(purchaseTickets).toThrow(InvalidPurchaseException);
        }
    );
    test.each([1, 3, 101, 5042683])(
        "should not throw if a positive integer",
        (value) => {
            const purchaseTickets = () => {
                new TicketService().purchaseTickets(
                    value,
                    new TicketTypeRequest("ADULT", 1)
                );
            };
            expect(purchaseTickets).not.toThrow(InvalidPurchaseException);
        }
    );
});

// Check type request only accepts valid types
describe("Check TicketTypeRequest only accepts valid types", () => {
    test("should throw if none passed", () => {
        const purchaseTickets = () => {
            new TicketTypeRequest();
        };
        expect(purchaseTickets).toThrow(TypeError);
    });
    test.each([null, true, undefined, [], {}, 0, 1, "test", "ADLT", ""])(
        "should throw for invalid type",
        (value) => {
            const purchaseTickets = () => {
                new TicketTypeRequest(value, 1);
            };
            expect(purchaseTickets).toThrow(TypeError);
        }
    );
    test.each(["ADULT", "CHILD", "INFANT"])(
        "should not throw for valid type",
        (value) => {
            const purchaseTickets = () => {
                new TicketTypeRequest(value, 1);
            };
            expect(purchaseTickets).not.toThrow(TypeError);
        }
    );
});

// Check type request only accepts valid quantities
describe("Check TicketTypeRequest only accepts valid quantities", () => {
    test("should throw if none passed", () => {
        const purchaseTickets = () => {
            new TicketTypeRequest("ADULT");
        };
        expect(purchaseTickets).toThrow(TypeError);
    });
    test.each([null, true, undefined, [], {}, 0, 1.5, -3, "test", ""])(
        "should throw if not a positive integer",
        (value) => {
            const purchaseTickets = () => {
                new TicketTypeRequest("ADULT", value);
            };
            expect(purchaseTickets).toThrow(TypeError);
        }
    );
    test.each([1, 5, 12])("should not throw if a positive integer", (value) => {
        const purchaseTickets = () => {
            new TicketTypeRequest("ADULT", value);
        };
        expect(purchaseTickets).not.toThrow(TypeError);
    });
});

// Check service only accepts valid type requests
describe("Check purchaseTickets only accepts valid TicketTypeRequests", () => {
    test("should throw if none passed", () => {
        const purchaseTickets = () => {
            new TicketService().purchaseTickets(1);
        };
        expect(purchaseTickets).toThrow(InvalidPurchaseException);
    });
    test.each(["test", [], {}, 1, 0, true])(
        "should throw if not a TicketTypeRequest",
        (value) => {
            const purchaseTickets = () => {
                new TicketService().purchaseTickets(1, value);
            };
            expect(purchaseTickets).toThrow(InvalidPurchaseException);
        }
    );
    test("should not throw if single passed", () => {
        const purchaseTickets = () => {
            new TicketService().purchaseTickets(
                1,
                new TicketTypeRequest("ADULT", 1)
            );
        };
        expect(purchaseTickets).not.toThrow(InvalidPurchaseException);
    });
    test.each([1, 2, 3, 5])("should not throw if multiple passed", (value) => {
        const purchaseTickets = () => {
            const ticketRequests = [];
            for (let i = 0; i < value; i++)
                ticketRequests.push(new TicketTypeRequest("ADULT", 1));
            new TicketService().purchaseTickets(1, ...ticketRequests);
        };
        expect(purchaseTickets).not.toThrow(InvalidPurchaseException);
    });
});

// Check service accepts maximum of 20 tickets
describe("Check purchaseTickets only accepts a maximum of 20 tickets", () => {
    test.each([
        [21, 0, 0],
        [1, 21, 0],
        [1, 0, 21],
        [10, 10, 10],
    ])(
        "should throw if more than 20 ordered",
        (adultQty, childQty, infantQty) => {
            const purchaseTickets = () => {
                const ticketRequests = [];
                if (adultQty > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("ADULT", adultQty)
                    );
                if (childQty > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("CHILD", childQty)
                    );
                if (infantQty > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("INFANT", infantQty)
                    );
                new TicketService().purchaseTickets(1, ...ticketRequests);
            };
            expect(purchaseTickets).toThrow(InvalidPurchaseException);
            // expect(purchaseTickets).toThrow(InvalidPurchaseException);
        }
    );
    test.each([
        [20, 0, 0],
        [1, 19, 0],
        [1, 0, 19],
        [5, 5, 5],
        [1, 0, 0],
    ])(
        "should not throw if 20 or less ordered",
        (adultQty, childQty, infantQty) => {
            const purchaseTickets = () => {
                const ticketRequests = [];
                if (adultQty > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("ADULT", adultQty)
                    );
                if (childQty > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("CHILD", childQty)
                    );
                if (infantQty > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("INFANT", infantQty)
                    );
                new TicketService().purchaseTickets(1, ...ticketRequests);
            };
            expect(purchaseTickets).not.toThrow(InvalidPurchaseException);
        }
    );
});

// Check can't purchase without at least 1 adult ticket
describe("Check purchaseTickets requires at least 1 adult ticket", () => {
    test.each([
        [0, 1],
        [1, 0],
    ])(
        "should throw if only child/infant tickets ordered",
        (childQty, infantQty) => {
            const purchaseTickets = () => {
                const ticketRequests = [];
                if (childQty > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("CHILD", childQty)
                    );
                if (infantQty > 0)
                    ticketRequests.push(
                        new TicketTypeRequest("INFANT", infantQty)
                    );
                new TicketService().purchaseTickets(1, ...ticketRequests);
            };
            expect(purchaseTickets).toThrow(InvalidPurchaseException);
        }
    );
    test.each([
        [0, 1],
        [1, 0],
    ])("should not throw if adult tickets ordered", (childQty, infantQty) => {
        const purchaseTickets = () => {
            const ticketRequests = [new TicketTypeRequest("ADULT", 1)];
            if (childQty > 0)
                ticketRequests.push(new TicketTypeRequest("CHILD", childQty));
            if (infantQty > 0)
                ticketRequests.push(new TicketTypeRequest("INFANT", infantQty));
            new TicketService().purchaseTickets(1, ...ticketRequests);
        };
        expect(purchaseTickets).not.toThrow(InvalidPurchaseException);
    });
});

// Check seat reservation made
describe("Check purchaseTickets reserves seats", () => {
    test("should have called reserveSeat for valid order", () => {
        const reserveSeatMock = jest.spyOn(
            SeatReservationService.prototype,
            "reserveSeat"
        );
        const ticketService = new TicketService();
        ticketService.purchaseTickets(1, new TicketTypeRequest("ADULT", 1));

        expect(reserveSeatMock).toHaveBeenCalled();
    });
});

// Check paymentservice called
describe("Check purchaseTickets makes a payment", () => {
    test("should have called makePayment for valid order", () => {
        const makePaymentMock = jest.spyOn(
            TicketPaymentService.prototype,
            "makePayment"
        );
        const ticketService = new TicketService();
        ticketService.purchaseTickets(1, new TicketTypeRequest("ADULT", 1));

        expect(makePaymentMock).toHaveBeenCalled();
    });
});

// Check return values
describe("Check purchaseTickets return values", () => {
    test("should not throw any errors", () => {
        const purchaseTickets = () => {
            new TicketService().purchaseTickets(
                1,
                new TicketTypeRequest("ADULT", 1)
            );
        };
        expect(purchaseTickets).not.toThrow();
    });

    test.each([
        [1, 0, 0, 1],
        [1, 1, 0, 2],
        [1, 1, 1, 2],
        [3, 4, 2, 7],
        [4, 5, 0, 9],
        [4, 0, 3, 4],
    ])(
        "should return correct no of seats for tickets ordered",
        (adultQty, childQty, infantQty, expectedSeats) => {
            const ticketRequests = [new TicketTypeRequest("ADULT", adultQty)];
            if (childQty > 0)
                ticketRequests.push(new TicketTypeRequest("CHILD", childQty));
            if (infantQty > 0)
                ticketRequests.push(new TicketTypeRequest("INFANT", infantQty));
            const { noOfSeats } = new TicketService().purchaseTickets(
                1,
                ...ticketRequests
            );

            expect(noOfSeats).toBe(expectedSeats);
        }
    );
    test.each([
        [1, 0, 0, 20],
        [1, 1, 0, 30],
        [1, 1, 1, 30],
        [3, 4, 2, 100],
        [4, 5, 0, 130],
        [4, 0, 3, 80],
        [6, 10, 3, 220],
    ])(
        "should return correct total cost for tickets ordered",
        (adultQty, childQty, infantQty, expectedCost) => {
            const ticketRequests = [new TicketTypeRequest("ADULT", adultQty)];
            if (childQty > 0)
                ticketRequests.push(new TicketTypeRequest("CHILD", childQty));
            if (infantQty > 0)
                ticketRequests.push(new TicketTypeRequest("INFANT", infantQty));
            const { totalCost } = new TicketService().purchaseTickets(
                1,
                ...ticketRequests
            );

            expect(totalCost).toBe(expectedCost);
        }
    );
});

// Check ticket type request is an immutable object
describe("Check TicketTypeRequest is an immutable object", () => {
    test("should throw if not frozen", () => {
        const isFrozen = Object.isFrozen(new TicketTypeRequest("ADULT", 1));
        expect(isFrozen).toBe(true);
    });
    test("should throw if attempt to mutate", () => {
        const tryToMutate = () => {
            var ticketRequest = new TicketTypeRequest("ADULT", 1);
            ticketRequest.getNoOfTickets = () => {};
        };
        expect(tryToMutate).toThrow(TypeError);
    });
});

// Check ticket service is an immutable object
describe("Check TicketService is an immutable object", () => {
    test("should throw if not frozen", () => {
        const isFrozen = Object.isFrozen(new TicketService());
        expect(isFrozen).toBe(true);
    });
    test("should throw if attempt to mutate", () => {
        const tryToMutate = () => {
            var ticketService = new TicketService();
            ticketService.purchaseTickets = () => {};
        };
        expect(tryToMutate).toThrow(TypeError);
    });
});
