import { Prisma, User } from "@prisma/client"
import settings from "../config/config"
import { UserService } from "prisma/services/accounts.service"
import { CategoryService, ListingService } from "prisma/services/listings.service"
import { FileService, ReviewService } from "prisma/services/general.service"
import { randomItem, slugify } from "src/utils"

class CreateData {
    constructor(
        private userService: UserService,
        private listingService: ListingService,
        private reviewService: ReviewService,
        private categoryService: CategoryService,
        private fileService: FileService,
    ) { }

    async createSuperuser(): Promise<User> {
        const userDict = {
            firstName: "Test",
            lastName: "Admin",
            email: settings.firstSuperuserEmail,
            password: settings.firstSuperuserPassword,
            isSuperuser: true,
            isStaff: true,
            isEmailVerified: true
        }
        const superuser: User | null = await this.userService.getByEmail(userDict.email as Prisma.UserWhereInput)
        if (!superuser) return await this.userService.create(userDict)
        return superuser
    }

    async createAuctioneer(): Promise<User> {
        const userDict = {
            firstName: "Test",
            lastName: "Auctioneer",
            email: settings.firstAuctioneerEmail,
            password: settings.firstAuctioneerPassword,
            isEmailVerified: true
        }
        const auctioneer: User | null = await this.userService.getByEmail(userDict.email as Prisma.UserWhereInput)
        if (!auctioneer) return await this.userService.create(userDict)
        return auctioneer
    }

    async createReviewer(): Promise<User> {
        const userDict = {
            firstName: "Test",
            lastName: "Reviewer",
            email: settings.firstReviewerEmail,
            password: settings.firstReviewerPassword,
            isEmailVerified: true
        }
        const reviewer: User | null = await this.userService.getByEmail(userDict.email as Prisma.UserWhereInput)
        if (!reviewer) return await this.userService.create(userDict)
        return reviewer
    }

    async createReviews(reviewerId: string) {
        const reviewsCount: number = await this.reviewService.getCount();
        if (reviewsCount < 1) {
            await this.reviewService.bulkCreate(this.reviewMappings(reviewerId))
        }
    }

    reviewMappings(reviewerId: string): { [key: string]: string | boolean }[] {
        return [
            {
                reviewerId: reviewerId,
                text: "Maecenas vitae porttitor neque, ac porttitor nunc. Duis venenatis lacinia libero. Nam nec augue ut nunc vulputate tincidunt at suscipit nunc.",
                show: true,
            },
            {
                reviewerId: reviewerId,
                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                show: true,
            },
            {
                reviewerId: reviewerId,
                text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
                show: true,
            },
        ]
    }

    async createCategories(): Promise<string[]> {
        var categoriesId: string[] = await this.categoryService.getAllIds();
        if (categoriesId.length < 1) {
            categoriesId = await this.categoryService.bulkCreate(this.categoryMappings())
        }
        return categoriesId
    }

    categoryMappings(): { [key: string]: string }[] {
        return [
            { name: "Tecnology", slug: "technology" },
            { name: "Accessories", slug: "accessories" },
            { name: "Automobile", slug: "automobile" },
            { name: "Fashion", slug: "fashion" },
        ]
    }

    async createListings(auctioneerId: string, categoryIds: string[]) {
        const fileTypeMappings: { [key: string]: string }[] = new Array(6).fill({ resourceType: "image/png" })
        const listingsCount: number = await this.listingService.getCount()
        if (listingsCount < 1) {
            const imageIds: string[] = await this.fileService.bulkCreate(fileTypeMappings)
            var updatedListingMappings: { [key: string]: string | number | Date }[] = []
            this.listingMappings().map((listing: { [key: string]: string | number | Date; }, i: number) => {
                listing.slug = slugify(listing.name as string)
                listing.categoryId = randomItem(categoryIds)
                listing.desc = "Korem ipsum dolor amet, consectetur adipiscing elit. Maece nas in pulvinar neque. Nulla finibus lobortis pulvinar. Donec a consectetur nulla."
                listing.auctioneerId = auctioneerId
                listing.closingDate = new Date(new Date().getTime() + (7 + i) * 24 * 60 * 60 * 1000) // Expires in 7+ days time 
                listing.imageId = imageIds[i]
                updatedListingMappings.push(listing)
            })
            this.listingService.bulkCreate(updatedListingMappings)

            // Upload Images
        }
    }

    listingMappings(): { [key: string]: string | number; }[] {
        return [
            { name: "Brand New royal Enfield 250 CC For special Sale", price: 6000.00 },
            { name: "Wedding wow Exclusive Cupple Ring (S2022)", price: 3000.00 },
            { name: "Toyota AIGID A Class Hatchback Sale", price: 2000.00 },
            { name: "Havit HV-G61 USB Black Double Game With Vibrat", price: 5000.85 },
            { name: "Brand New Honda CBR 600 RR For Sale (2022)", price: 9000.00 },
            { name: "IPhone 11 Pro Max All Variants Available For Sale", price: 4000.00 },
        ]
    }
}