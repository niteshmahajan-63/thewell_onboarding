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
        return this.prisma.onboardingSteps.findMany();
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
        // First, get all onboarding steps
        const steps = await this.prisma.onboardingSteps.findMany();

        // For each step, check if there's a corresponding client step for the zoho record
        const stepsWithStatus = await Promise.all(
            steps.map(async (step) => {
                const clientStep = await this.prisma.clientSteps.findFirst({
                    where: {
                        zohoRecordId,
                        stepId: step.id,
                    },
                });

                return {
                    ...step,
                    isCompleted: clientStep ? clientStep.isCompleted : false,
                    isRequired: !!clientStep, // If clientStep exists, the step is required
                };
            }),
        );

        return stepsWithStatus;
    }
}
