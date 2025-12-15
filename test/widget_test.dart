import 'package:flutter_test/flutter_test.dart';
import 'package:inkup/home_screen.dart';
import 'package:inkup/main.dart';

void main() {
  testWidgets('Home screen smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that the title is displayed.
    expect(find.text('Printing Shop Name'), findsOneWidget);

    // Verify that "Bill Book" menu item is present.
    expect(find.text('Bill Book'), findsOneWidget);

    // Verify that bottom nav "Home" is present.
    expect(find.text('Home'), findsOneWidget);
  });
}
