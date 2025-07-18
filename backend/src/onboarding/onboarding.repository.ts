import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class OnboardingRepository {
    private readonly logger = new Logger(OnboardingRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Upsert client data in the database
     */
    async upsertClient(clientData: any): Promise<any> {
        return this.prisma.client.upsert({
            where: { zohoRecordId: clientData.zohoRecordId },
            update: clientData,
            create: clientData,
        });
    }

    /**
     * Find OnboardingStep by name
     */
    async findOnboardingStepByName(name: string): Promise<any> {
        return this.prisma.onboardingSteps.findFirst({
            where: { name }
        });
    }

    /**
     * Find all onboarding steps
     */
    async findOnboardingSteps(): Promise<any[]> {
        return this.prisma.onboardingSteps.findMany({
            orderBy: {
                id: 'asc',
            },
        });
    }

    /**
     * Find ClientStep by zohoRecordId and stepId
     */
    async findClientStep(zohoRecordId: string, stepId: number): Promise<any> {
        return this.prisma.clientSteps.findFirst({
            where: {
                zohoRecordId,
                stepId,
            }
        });
    }

    /**
     * Create a client step
     */
    async createClientStep(zohoRecordId: string, stepId: number, isCompleted: boolean = false): Promise<any> {
        return this.prisma.clientSteps.create({
            data: {
                zohoRecordId,
                stepId,
                isCompleted,
            },
        });
    }

    /**
     * Find all onboarding steps with their completion status for a specific record
     */
    async findOnboardingStepsWithStatus(zohoRecordId: string): Promise<any[]> {
        const steps = await this.prisma.onboardingSteps.findMany({
            orderBy: {
                id: 'asc',
            },
        });

        const stepsWithStatus = await Promise.all(
            steps.map(async (step) => {
                const clientStep = await this.prisma.clientSteps.findFirst({
                    where: {
                        zohoRecordId,
                        stepId: step.id,
                    },
                });

                if (clientStep) {
                    return {
                        ...step,
                        isCompleted: clientStep.isCompleted,
                        isRequired: true,
                    };
                }
                return null;
            }),
        );

        return stepsWithStatus.filter(step => step !== null);
    }

    /**
     * Update a client step completion status
     */
    async updateStepCompletionStatus(zohoRecordId: string, stepId: number, isCompleted: boolean = true): Promise<any> {
        const clientStep = await this.findClientStep(zohoRecordId, stepId);

        if (!clientStep) {
            this.logger.warn(`No client step found for record ${zohoRecordId} and step ${stepId}`);
            return null;
        }

        if (stepId === 1 && isCompleted) {
            await this.prisma.client.update({
                where: { zohoRecordId },
                data: { pandadocAgreementCompleted: "Yes" },
            })
        }

        if (stepId === 2 && isCompleted) {
            await this.prisma.client.update({
                where: { zohoRecordId },
                data: { stripePaymentCompleted: "Yes" },
            })
        }

        return this.prisma.clientSteps.update({
            where: {
                id: clientStep.id,
            },
            data: {
                isCompleted,
            },
        });
    }

    /**
     * Find a record by its ID
     */
    async findRecordById(recordId: string): Promise<any> {
        return this.prisma.client.findUnique({
            where: { zohoRecordId: recordId },
        });
    }

    async getStripePaymentRecord(recordId: string): Promise<any> {
        return this.prisma.stripePayments.findFirst({
            where: { zohoRecordId: recordId },
        });
    }
}
