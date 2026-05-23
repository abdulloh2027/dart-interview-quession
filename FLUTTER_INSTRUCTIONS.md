# Dart Interview Master - Flutter Implementation

To use this logic in a real Flutter app, follow these steps:

## 1. Add Dependencies
Add these to your `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  provider: ^6.1.2
```

## 2. Model: `lib/models/question.dart`
```dart
import 'package:hive/hive.dart';

part 'question.g.dart';

@HiveType(typeId: 0)
class Question extends HiveObject {
  @HiveField(0)
  String question;

  @HiveField(1)
  String answer;

  @HiveField(2)
  bool isLearned;

  Question({
    required this.question,
    required this.answer,
    this.isLearned = false,
  });
}
```

## 3. Main App & State: `lib/main.dart`
(I've provided the full logic in the final response)
