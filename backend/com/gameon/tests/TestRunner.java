package com.gameon.tests;

/**
 * TestRunner
 * Master CLI test runner executing the complete OOP and Concurrency test suites.
 */
public class TestRunner {

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("   GAME ON - MASTER OOP & CONCURRENCY TEST SUITE  ");
        System.out.println("=================================================\n");

        long startTime = System.currentTimeMillis();
        boolean allPassed = false;

        try {
            // 1. Run all OOP architecture tests
            OOPArchitectureTest.runAll();

            // 2. Run all concurrency stress tests
            ConcurrencyStressTest.runAll();

            allPassed = true;
        } catch (Throwable t) {
            System.err.println("\n[FATAL ERROR] Test execution failed with error:");
            t.printStackTrace();
        }

        long duration = System.currentTimeMillis() - startTime;
        System.out.println("=================================================");
        if (allPassed) {
            System.out.printf("   ALL TESTS PASSED SUCCESSFULLY! (Time: %d ms)%n", duration);
        } else {
            System.out.printf("   TEST SUITE FAILED! (Time: %d ms)%n", duration);
            System.exit(1);
        }
        System.out.println("=================================================");
    }
}
